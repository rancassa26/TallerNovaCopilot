import { v4 as uuidv4 } from 'uuid';

export class AuditLog {
  public readonly id: string;
  public readonly userId: string;
  public readonly action: string;
  public readonly timestamp: Date;
  public readonly details: Record<string, any>;
  public readonly correlationId: string;

  constructor(
    userId: string,
    action: string,
    details: Record<string, any>,
    correlationId: string,
  ) {
    this.id = uuidv4();
    this.userId = userId;
    this.action = action;
    this.timestamp = new Date();
    this.details = details;
    this.correlationId = correlationId;
  }
}