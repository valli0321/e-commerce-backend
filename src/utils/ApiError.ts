export class ApiError extends Error {
    public statusCode: number;
    public errors?: any;
    public stack?: string;
    public success: boolean
  
    constructor(statusCode: number, message: string, errors = {}, stack = "") {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.success = false
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  