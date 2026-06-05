import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportResultsDto {
  @IsOptional()
  @IsString()
  reconciliationId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['json', 'csv'])
  format?: string;
}
