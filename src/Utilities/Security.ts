import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

export const HashPassword = (pass: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pass, salt);
};

export const generateToken = (
  payload: Record<string, string | number>,
  secret: string,
  expire: number
) => {
  const token = JWT.sign(payload, secret, { expiresIn: expire });
  return token;
};
