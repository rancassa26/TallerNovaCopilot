import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseResponseDTO } from '../models/index';
import { CorrelationIdService } from './correlation-id.service';
import { LoggerService } from './logger.service';

/**
 * HttpClientService - Wraps Angular HttpClient
 * Automatically handles BaseResponseDTO unwrapping and error handling
 */
@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private apiUrl = 'http://localhost:3000/api'; // Will be configurable

  constructor(
    private http: HttpClient,
    private correlationIdService: CorrelationIdService,
    private logger: LoggerService,
  ) {}

  get<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .get<BaseResponseDTO<T>>(url, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.logger.log(`GET ${endpoint} - Success`, response.correlationId);
          return response.data as T;
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .post<BaseResponseDTO<T>>(url, body, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.logger.log(`POST ${endpoint} - Success`, response.correlationId);
          return response.data as T;
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .put<BaseResponseDTO<T>>(url, body, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.logger.log(`PUT ${endpoint} - Success`, response.correlationId);
          return response.data as T;
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .patch<BaseResponseDTO<T>>(url, body, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.logger.log(`PATCH ${endpoint} - Success`, response.correlationId);
          return response.data as T;
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .delete<BaseResponseDTO<T>>(url, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          this.logger.log(`DELETE ${endpoint} - Success`, response.correlationId);
          return response.data as T;
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  private getHeaders(): any {
    return {
      'X-Correlation-ID': this.correlationIdService.getCorrelationId(),
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    this.logger.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
