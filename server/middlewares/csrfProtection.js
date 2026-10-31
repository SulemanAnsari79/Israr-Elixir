const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const requestOrigin = req.get("origin");
  if (!requestOrigin) {
    return next();
  }

  const allowedOrigins = req.app.locals.allowedOrigins || [];
  if (!allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({ success: false, message: "Invalid request origin" });
  }

  next();
};

export default csrfProtection;
