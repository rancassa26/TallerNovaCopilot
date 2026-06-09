import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateReconciliationDto {
  @IsString()
  @IsNotEmpty()
  reconciliationId!: string;
}
