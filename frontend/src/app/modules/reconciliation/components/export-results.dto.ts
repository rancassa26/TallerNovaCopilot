import { IsOptional, IsString, IsIn } from 'class-validator';

export class ExportResultsDto {
  @IsOptional()
  @IsString()
  reconciliationId?: string;

  @IsOptional()
  @IsIn(['json', 'csv'], { message: 'El formato debe ser json o csv' })
  format?: 'json' | 'csv' = 'json';
}