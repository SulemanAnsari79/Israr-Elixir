// Authentication tokens are HttpOnly cookies set and cleared by the server.
export const getAuthCookie = () => null;
export const setAuthCookie = () => {
  throw new Error("Authentication cookies must be set by the server");
};
export const clearAuthCookies = () => {};
