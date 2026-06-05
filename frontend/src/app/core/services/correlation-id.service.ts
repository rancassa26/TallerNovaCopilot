import { Injectable } from '@angular/core';

/**
 * CorrelationIdService - Generates and manages correlation IDs for tracing requests
 */
@Injectable({
  providedIn: 'root',
})
export class CorrelationIdService {
  private correlationId: string;

  constructor() {
    this.correlationId = this.generateId();
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  generateNewId(): string {
    this.correlationId = this.generateId();
    return this.correlationId;
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
