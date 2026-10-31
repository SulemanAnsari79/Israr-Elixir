import jwt from "jsonwebtoken";

export const jwtOptions = {
  algorithm: "HS256",
  issuer: process.env.JWT_ISSUER || "sehatrazz-api",
  audience: process.env.JWT_AUDIENCE || "sehatrazz-client",
};

export const signAccessToken = (payload, options = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    ...jwtOptions,
    expiresIn: "1d",
    ...options,
});

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: [jwtOptions.algorithm],
    issuer: jwtOptions.issuer,
    audience: jwtOptions.audience,
});
