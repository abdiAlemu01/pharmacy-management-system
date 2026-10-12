import { ZodError } from 'zod';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.filter((p) => p !== 'body').join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: errors[0]?.message || 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};

