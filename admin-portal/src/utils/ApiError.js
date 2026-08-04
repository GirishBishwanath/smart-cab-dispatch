/**
 * Client-side mirror of backend/src/utils/ApiError.js so every rejected request
 * surfaces the same shape regardless of whether it failed on the network,
 * in transport, or with a structured API error response.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export default ApiError;
