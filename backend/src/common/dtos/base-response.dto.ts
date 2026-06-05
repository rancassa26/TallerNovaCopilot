/**
 * BaseResponseDTO - Generic wrapper for all API responses
 * Ensures consistent response format across all endpoints
 */
export class BaseResponseDTO<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  errorCode?: string;
  correlationId: string;
  timestamp: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    correlationId: string,
    data?: T,
    error?: string,
    errorCode?: string,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.error = error;
    this.errorCode = errorCode;
    this.correlationId = correlationId;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    message: string,
    data: T,
    correlationId: string,
    statusCode = 200,
  ): BaseResponseDTO<T> {
    return new BaseResponseDTO(true, statusCode, message, correlationId, data);
  }

  static error(
    message: string,
    correlationId: string,
    statusCode = 500,
    errorCode?: string,
    error?: string,
  ): BaseResponseDTO<null> {
    return new BaseResponseDTO(
      false,
      statusCode,
      message,
      correlationId,
      null,
      error,
      errorCode,
    );
  }
}
