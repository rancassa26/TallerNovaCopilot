import { ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';
import { LoggerService } from '../logger/logger.service';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockLoggerService: LoggerService;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  const correlationId = 'test-correlation-id-123';
  const requestUrl = '/test-path';

  beforeEach(() => {
    mockLoggerService = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      correlationId: correlationId,
      url: requestUrl,
    };

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getType: jest.fn(),
      getArgs: jest.fn(),
      // Add other methods if needed by the filter, though not strictly necessary for this one
    } as unknown as ArgumentsHost;

    filter = new GlobalExceptionFilter(mockLoggerService);
  });

  it('should catch HttpException and return appropriate status and message', () => {
    const exception = new BadRequestException('Invalid input data');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid input data',
        error: 'BadRequestException',
        path: requestUrl,
        correlationId: correlationId,
      }),
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid input data',
        status: HttpStatus.BAD_REQUEST,
        correlationId: correlationId,
      }),
      exception.stack,
      'GlobalExceptionFilter',
    );
  });

  it('should catch generic Error and return 500 Internal Server Error', () => {
    const exception = new Error('Something unexpected happened');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something unexpected happened',
        error: 'Error',
        path: requestUrl,
        correlationId: correlationId,
      }),
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Something unexpected happened',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        correlationId: correlationId,
      }),
      exception.stack,
      'GlobalExceptionFilter',
    );
  });

  it('should catch unknown exceptions and return 500 Internal Server Error', () => {
    const exception = 'Just a string error'; // An unknown type of exception

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error', // Default message for unknown exceptions
        error: 'Error', // Default error name
        path: requestUrl,
        correlationId: correlationId,
      }),
    );
    expect(mockLoggerService.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        correlationId: correlationId,
      }),
      undefined, // No stack for string error
      'GlobalExceptionFilter',
    );
  });
});