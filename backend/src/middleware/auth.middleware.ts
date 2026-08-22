import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import prisma from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Unauthorized or inactive account' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    next();
  };
};
