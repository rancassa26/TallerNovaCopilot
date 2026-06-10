import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum IncidentStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  INVESTIGATING = 'INVESTIGATING',
}

export class ResolveIncidentDto {
  @IsEnum(IncidentStatus, {
    message: 'Status must be PENDING, RESOLVED, or INVESTIGATING',
  })
  @IsNotEmpty()
  status!: IncidentStatus;
}