class ApiResponse {
  constructor(statusCode, messag="success", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode <=400
  }
}