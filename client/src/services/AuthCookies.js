const cookieOptions = "path=/; SameSite=Lax";

export const getAuthCookie = (name) => {
  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
};

export const setAuthCookie = (name, value) => {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; ${cookieOptions}`;
};

export const clearAuthCookies = () => {
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieOptions}`;
  document.cookie = `user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieOptions}`;
};
