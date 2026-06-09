import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoadReconciliationAccountDto, LoadReconciliationIncidentDto } from '../../application/dto/load-reconciliation.input.dto';

export class LoadReconciliationDto {
  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadReconciliationAccountDto)
  accounts!: LoadReconciliationAccountDto[];
}
