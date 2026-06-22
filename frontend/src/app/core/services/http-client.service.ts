import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseResponseDTO } from '../models/index';
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
    private logger: LoggerService,
  ) {}

  get<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http
      .get<BaseResponseDTO<T>>(url)
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
    // Retorna un objeto vacío para dejar que los interceptores manejen los headers globales
    return {};
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    let correlationId: string | undefined;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor (HTTP 4xx/5xx)
      if (error.error && typeof error.error === 'object') {
        // Intentamos extraer el mensaje y el correlationId del cuerpo estructurado (BaseResponseDTO)
        errorMessage = error.error.message || `Error Code: ${error.status}`;
        correlationId = error.error.correlationId;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    // Logueamos el error incluyendo el correlationId para trazabilidad técnica
    this.logger.error(errorMessage, correlationId);

    // Retornamos un objeto estructurado en lugar de un Error genérico para no "esconder" metadata
    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      correlationId: correlationId,
      originalError: error
    }));
  }
}
