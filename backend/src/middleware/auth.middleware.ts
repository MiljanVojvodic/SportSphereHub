import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto';

export interface AuthRequest extends Request {
  user?: { id: string; username: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Token nije pronađen' });
    return;
  }

  try {
    const decoded = verifyToken(token) as { id: string; username: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Token nije validan ili je istekao' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Nemate ovlašćenje za ovu akciju' });
      return;
    }
    next();
  };
};
