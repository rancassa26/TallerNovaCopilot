import { Test, TestingModule } from '@nestjs/testing';
import { SchemaValidatorService } from './schema-validator.service';
import { ValidationException } from '../../../common/exceptions/base.exception';

describe('SchemaValidatorService', () => {
  let service: SchemaValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaValidatorService],
    }).compile();

    service = module.get<SchemaValidatorService>(SchemaValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    const correlationId = 'test-correlation-id';

    it('should pass for valid data matching a simple schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };
      const data = { name: 'John Doe', age: 30 };

      expect(() => service.validate(schema, data, correlationId)).not.toThrow();
    });

    it('should throw ValidationException for invalid data', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };
      const data = { age: 'not-a-number' }; // missing 'name' and wrong type for 'age'

      expect(() => service.validate(schema, data, correlationId)).toThrow(ValidationException);
    });

    it('should validate complex nested schemas', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['id'],
          },
        },
      };
      const data = {
        user: {
          id: '123',
          tags: ['admin', 'editor'],
        },
      };

      expect(() => service.validate(schema, data, correlationId)).not.toThrow();
    });

    it('should validate formats (email) correctly', () => {
      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
      };
      const validData = { email: 'test@example.com' };
      const invalidData = { email: 'not-an-email' };

      expect(() => service.validate(schema, validData, correlationId)).not.toThrow();
      expect(() => service.validate(schema, invalidData, correlationId)).toThrow(ValidationException);
    });
  });
});