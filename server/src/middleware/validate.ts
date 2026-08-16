import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { badRequest } from '../utils/apiError';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((e) => (typeof e.msg === 'string' ? e.msg : 'Validation error'))
        .join(', ');
      return next(badRequest(message));
    }
    next();
  };
};
