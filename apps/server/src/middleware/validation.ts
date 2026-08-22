import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createValidator = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request', details: result.error.issues });
    }
    // attach parsed data
    req.body = result.data;
    next();
  };
};
