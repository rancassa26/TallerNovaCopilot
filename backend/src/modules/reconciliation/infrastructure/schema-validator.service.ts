import { Injectable } from '@nestjs/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationException } from '../../../common/exceptions/base.exception';

@Injectable()
export class SchemaValidatorService {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);
  }

  validate(schema: any, data: any, correlationId: string): void {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors
        ?.map((err) => `${err.instancePath} ${err.message}`)
        .join(', ');
      
      throw new ValidationException(
        `JSON Schema validation failed: ${errors}`,
        correlationId
      );
    }
  }
}