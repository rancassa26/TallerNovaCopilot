import { Injectable, BadRequestException } from '@nestjs/common';
import Ajv from 'ajv';

@Injectable()
export class SchemaValidatorService {
  private ajv = new Ajv();

  /**
   * Valida un objeto contra un esquema JSON.
   * @throws BadRequestException si la validación falla.
   */
  validate(schema: object, data: any, correlationId?: string): void {
    const validate = this.ajv.compile(schema);
    const isValid = validate(data);

    if (!isValid) {
      const errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`).join(', ');
      throw new BadRequestException({
        message: `Error de validación de esquema: ${errors}`,
        correlationId
      });
    }
  }
}