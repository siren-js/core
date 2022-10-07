import { ValidationError as ClassValidationError } from 'class-validator';

export class ValidationError extends Error {
  constructor(public readonly errors: ClassValidationError[]) {
    super(`Validation failed with ${errors.length} errors`);
  }
}
