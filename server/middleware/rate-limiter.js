const normalizePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getClientIp = (req) => {
  if (!req) {
    return "unknown";
  }

  const forwardedFor = req.headers ? req.headers["x-forwarded-for"] : null;
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  if (req.ip) {
    return req.ip;
  }

  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  return "unknown";
};

const userAwareKeyGenerator = (req) => {
  if (req && req.userId) {
    return `user:${req.userId}`;
  }

  return `ip:${getClientIp(req)}`;
};

const createScopedKeyGenerator = (scopeBuilder) => (req) => {
  const baseKey = userAwareKeyGenerator(req);
  const scopeValue = typeof scopeBuilder === "function" ? scopeBuilder(req) : null;

  if (scopeValue) {
    return `${scopeValue}:${baseKey}`;
  }

  return baseKey;
};

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 60,
    message = "Too many requests. Please try again later.",
    statusCode = 429,
    keyGenerator = getClientIp,
    skip = () => false,
  } = options;

  const safeWindowMs = normalizePositiveInteger(windowMs, 60 * 1000);
  const safeMax = normalizePositiveInteger(max, 60);

  const requestLog = new Map();

  return (req, res, next) => {
    if (typeof skip === "function" && skip(req, res)) {
      return next();
    }

    const key = keyGenerator(req);
    if (!key) {
      return next();
    }

    const now = Date.now();
    const windowStart = now - safeWindowMs;

    const timestamps = requestLog.get(key) || [];
    const recentTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);
    recentTimestamps.push(now);
    requestLog.set(key, recentTimestamps);

    if (recentTimestamps.length > safeMax) {
      const oldestWithinWindow = recentTimestamps[0];
      const retryAfterMs = oldestWithinWindow + safeWindowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    if (recentTimestamps.length === 0) {
      requestLog.delete(key);
    }

    next();
  };
};

module.exports = {
  createRateLimiter,
  userAwareKeyGenerator,
  createScopedKeyGenerator,
};
