import { Request, Response, NextFunction } from 'express';

/**
 * Deeply sanitizes objects by deleting keys starting with '$' or containing '.'
 */
const cleanObject = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          cleanObject(obj[key]);
        }
      }
    }
  }
  return obj;
};

export const mongoSanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) cleanObject(req.body);
  if (req.query) cleanObject(req.query);
  if (req.params) cleanObject(req.params);
  next();
};
