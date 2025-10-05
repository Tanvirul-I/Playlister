const auth = require("../auth");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";
const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const REMEMBER_ME_MAX_AGE = 30 * 24 * ONE_HOUR_IN_MS;

const CSRF_COOKIE_NAME = "csrfToken";

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const setCsrfCookie = (res, maxAge) => {
  const csrfToken = generateCsrfToken();
  const csrfCookieOptions = {
    ...baseCookieOptions,
    httpOnly: false,
  };

  if (typeof maxAge === "number") {
    csrfCookieOptions.maxAge = maxAge;
  }

  res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions);
  return csrfToken;
};

const issueSessionCookies = (res, token, maxAge) => {
  const authCookieOptions = {
    ...baseCookieOptions,
  };

  if (typeof maxAge === "number") {
    authCookieOptions.maxAge = maxAge;
  }

  res.cookie("token", token, authCookieOptions);
  return setCsrfCookie(res, maxAge);
};

const GUEST_ACCOUNT_USERNAME = "__guest_account__";
const GUEST_EMAIL = "guest@playlister.local";
/**
 *
 * Back-end API that handles the user authentication.
 *
 */
const buildGuestUser = () => ({
  firstName: "Guest",
  lastName: "User",
  email: "",
  username: "guest",
  isGuest: true,
});

const ensureGuestAccount = async () => {
  const existingGuest = await User.findOne({
    username: GUEST_ACCOUNT_USERNAME,
    isGuest: true,
  }).exec();
  if (existingGuest) {
    return existingGuest;
  }

  const placeholderSecret =
    process.env.GUEST_ACCOUNT_SEED || crypto.randomBytes(48).toString("hex");
  const passwordHash = await bcrypt.hash(placeholderSecret, 10);

  const guestAccount = await User.findOneAndUpdate(
    { username: GUEST_ACCOUNT_USERNAME, isGuest: true },
    {
      $setOnInsert: {
        firstName: "Guest",
        lastName: "User",
        email: GUEST_EMAIL,
        passwordHash,
        playlists: [],
        username: GUEST_ACCOUNT_USERNAME,
        isGuest: true,
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).exec();

  return guestAccount;
};

getLoggedIn = async (req, res) => {
  try {
    let session = auth.verifyUser(req);
    if (!session) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
        errorMessage: "User not logged in",
      });
    }

    if (session.isGuest) {
      const guestAccount = await ensureGuestAccount();

      if (!guestAccount) {
        return res.status(500).json({
          loggedIn: false,
          user: null,
          errorMessage: "Guest session unavailable",
        });
      }

      const guestId = guestAccount._id.toString();
      const sessionUserId = typeof session.userId === "string" ? session.userId : "";

      const needsRefresh = !sessionUserId || sessionUserId !== guestId;
      if (needsRefresh) {
        const refreshedToken = auth.signToken(guestId, {
          isGuest: true,
          rememberMe: false,
        });
        issueSessionCookies(res, refreshedToken, ONE_HOUR_IN_MS);
      } else if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
        setCsrfCookie(res, ONE_HOUR_IN_MS);
      }

      return res.status(200).json({
        loggedIn: true,
        user: buildGuestUser(),
      });
    }

    const loggedInUser = await User.findOne({ _id: session.userId });

    if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
      const maxAge = session.rememberMe ? REMEMBER_ME_MAX_AGE : ONE_HOUR_IN_MS;
      setCsrfCookie(res, maxAge);
    }

    return res.status(200).json({
      loggedIn: true,
      user: {
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        email: loggedInUser.email,
        username: loggedInUser.username,
      },
    });
  } catch (err) {
    console.log("err: " + err);
    res.json(false);
  }
};

loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe: rememberMeRaw } = req.body;

    const rememberMe = Boolean(rememberMeRaw);

    if (!email || !password) {
      return res.status(400).json({ errorMessage: "Please enter all required fields." });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }
    const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
    if (!passwordCorrect) {
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    // LOGIN THE USER
    const cookieMaxAge = rememberMe ? REMEMBER_ME_MAX_AGE : ONE_HOUR_IN_MS;
    const token = auth.signToken(existingUser._id, { rememberMe });
    issueSessionCookies(res, token, cookieMaxAge);

    return res.status(200).json({
      success: true,
      loggedIn: true,
      user: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        username: existingUser.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

logoutUser = async (req, res) => {
  res.cookie("token", "", {
    ...baseCookieOptions,
    expires: new Date(0),
  });
  res.cookie(CSRF_COOKIE_NAME, "", {
    ...baseCookieOptions,
    httpOnly: false,
    expires: new Date(0),
  });
  res.send();
};

registerUser = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password, passwordVerify } = req.body;
    if (!firstName || !lastName || !email || !password || !passwordVerify || !username) {
      return res.status(400).json({ errorMessage: "Please enter all required fields." });
    }
    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this username already exists.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash,
      username,
    });
    const savedUser = await newUser.save();

    // LOGIN THE USER
    const token = auth.signToken(savedUser._id, { rememberMe: false });

    issueSessionCookies(res, token, ONE_HOUR_IN_MS);

    return res.status(200).json({
      success: true,
      loggedIn: true,
      user: {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        username: savedUser.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

continueAsGuest = async (_req, res) => {
  try {
    const guestAccount = await ensureGuestAccount();

    if (!guestAccount) {
      return res.status(500).json({
        success: false,
        loggedIn: false,
        errorMessage: "Guest session unavailable.",
      });
    }

    const guestId = guestAccount._id.toString();
    const token = auth.signToken(guestId, {
      isGuest: true,
      rememberMe: false,
    });
    const guestUser = buildGuestUser();

    issueSessionCookies(res, token, ONE_HOUR_IN_MS);

    return res.status(200).json({
      success: true,
      loggedIn: true,
      user: guestUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

module.exports = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  continueAsGuest,
};
