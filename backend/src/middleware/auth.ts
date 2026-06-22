import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db, Role } from '../data/store';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; email: string };
}

export function createToken(payload: { id: string; role: Role; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: Role; email: string };
    const existingUser = db.users.find((user) => user.id === decoded.id);
    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid token user' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
