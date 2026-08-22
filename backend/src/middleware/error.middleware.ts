import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: (err as any).errors || err.issues,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
