import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EmbeddedEntity } from '../EmbeddedEntity';
import { EmbeddedLink } from '../EmbeddedLink';
import { UnknownRecord } from './UnknownRecord';
import { ValidationError } from './ValidationError';

export function transformAndValidate<T extends UnknownRecord>(constructor: ClassConstructor<T>, value: UnknownRecord) {
  const instance = plainToInstance(constructor, value);
  validate(instance);
  return instance;
}

function validate(obj: UnknownRecord): void {
  const errors = validateSync(obj);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

export function transformSubEntities(subEntities: UnknownRecord[]): (EmbeddedEntity | EmbeddedLink)[] {
  return subEntities.map(transformSubEntity);
}

function transformSubEntity(subEntity: UnknownRecord): EmbeddedEntity | EmbeddedLink {
  const constructor: ClassConstructor<EmbeddedEntity | EmbeddedLink> = subEntity.href ? EmbeddedLink : EmbeddedEntity;
  return plainToInstance(constructor, subEntity);
}
