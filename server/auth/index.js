const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function authManager() {
  verify = (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: "Unauthorized",
        });
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const isGuest = !!verified.isGuest;
      let normalizedUserId = verified.userId;

      if (
        normalizedUserId &&
        typeof normalizedUserId === "object" &&
        typeof normalizedUserId.toString === "function"
      ) {
        normalizedUserId = normalizedUserId.toString();
      }

      const isValidUserId =
        normalizedUserId && mongoose.Types.ObjectId.isValid(normalizedUserId);

      if (!isGuest && !isValidUserId) {
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: "Unauthorized",
        });
      }

      req.userId = isValidUserId ? normalizedUserId : undefined;
      req.isGuest = isGuest;

      const requestMethod =
        typeof req.method === "string" ? req.method.toUpperCase() : "GET";
      const requiresCsrfProtection = !SAFE_HTTP_METHODS.has(requestMethod);

      if (requiresCsrfProtection) {
        const csrfCookie = req.cookies ? req.cookies.csrfToken : undefined;
        const csrfHeader = req.get("X-CSRF-Token");

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
          return res.status(403).json({
            loggedIn: false,
            user: null,
            errorMessage: "CSRF token mismatch",
          });
        }
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({
        loggedIn: false,
        user: null,
        errorMessage: "Unauthorized",
      });
    }
  };

  verifyUser = (req) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return null;
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (
        decodedToken &&
        decodedToken.userId &&
        typeof decodedToken.userId === "object" &&
        typeof decodedToken.userId.toString === "function"
      ) {
        decodedToken.userId = decodedToken.userId.toString();
      }

      return decodedToken;
    } catch (err) {
      return null;
    }
  };

  signToken = (userId, options = {}) => {
    let normalizedUserId = userId;

    if (
      normalizedUserId &&
      typeof normalizedUserId === "object" &&
      typeof normalizedUserId.toString === "function"
    ) {
      normalizedUserId = normalizedUserId.toString();
    }

    return jwt.sign(
      {
        userId: normalizedUserId,
        ...options,
      },
      process.env.JWT_SECRET,
    );
  };

  return this;
}

const auth = authManager();
module.exports = auth;
