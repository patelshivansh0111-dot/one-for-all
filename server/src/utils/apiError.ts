export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const badRequest = (message: string) => new ApiError(message, 400);
export const unauthorized = (message = 'Unauthorized') => new ApiError(message, 401);
export const forbidden = (message = 'Forbidden') => new ApiError(message, 403);
export const notFound = (message = 'Resource not found') => new ApiError(message, 404);
export const conflict = (message: string) => new ApiError(message, 409);
