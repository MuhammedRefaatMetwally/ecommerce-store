export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean; // Marks this error as predictable and safe to show to clients
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
    // Removes unnecessary stack trace lines so the error trace looks clean.
  }
}
