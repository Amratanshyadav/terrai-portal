export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[] | null;

  constructor(statusCode: number, message: string, errors: any[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', errors: any[] | null = null) {
    super(400, message, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource Not Found') {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource Conflict') {
    super(409, message);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message: string = 'Unprocessable Entity', errors: any[] | null = null) {
    super(422, message, errors);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error') {
    super(500, message);
  }
}
