export class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public data?: T;
  
    constructor(statusCode: number, message: string, data?: T) {
      this.success = statusCode < 400;
      this.message = message;
      if (data !== undefined) {
        this.data = data;
      }
    }
  }
  