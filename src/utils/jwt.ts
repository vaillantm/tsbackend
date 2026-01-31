import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export const signToken = (id: string): string => {
  const secret: Secret = config.JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as any,
  };

  return jwt.sign({ id }, secret, options);
};
