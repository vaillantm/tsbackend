import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string };
    User.findById(decoded.id)
      .then((u) => {
        if (!u) return res.status(401).json({ message: 'Unauthorized' });
        req.user = { id: u._id.toString(), name: u.name, username: u.username, email: u.email, role: u.role as any, avatar: u.avatar };
        next();
      })
      .catch(next);
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function authorize(...roles: Array<'admin' | 'vendor' | 'customer'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
