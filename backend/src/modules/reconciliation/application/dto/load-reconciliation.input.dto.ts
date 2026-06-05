import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LoadReconciliationAccountDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  ledgerBalance: number;

  @Type(() => Number)
  @IsNumber()
  systemBalance: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadReconciliationIncidentDto)
  incidents?: LoadReconciliationIncidentDto[];
}

export class LoadReconciliationIncidentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  amount: number;
}

export class LoadReconciliationInputDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadReconciliationAccountDto)
  accounts: LoadReconciliationAccountDto[];
}
