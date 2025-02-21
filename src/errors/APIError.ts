class APIError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: string;
  constructor(
    statusCode: number,
    message: string,
    errorCode: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
  }
}

export default APIError;
