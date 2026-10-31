import { signAccessToken } from "./jwt.js";

const generateToken = (id, role, sessionVersion = 0) => {
  return signAccessToken({ _id: id, role, sessionVersion });
};

export default generateToken;
