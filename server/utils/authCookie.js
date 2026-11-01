const AUTH_COOKIE_NAME = "auth_token";

const isSecureDeployment =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.AUTH_COOKIE_SECURE === "true";

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isSecureDeployment,
  sameSite: isSecureDeployment ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});


export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
};

export { AUTH_COOKIE_NAME };
