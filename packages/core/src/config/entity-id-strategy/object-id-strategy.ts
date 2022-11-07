import { EntityIdStrategy } from './entity-id-strategy';

/**
 * @description
 * 实体的主键 ID 策略
 *
 * @example
 * ```typescript
 * }
 * ```
 *
 * @docsCategory configuration
 * @docsPage EntityIdStrategy
 */
export class ObjectIdStrategy implements EntityIdStrategy<'objectId'> {
  readonly primaryKeyType = 'objectId';
  decodeId(id: string): string {
    return id;
  }
  encodeId(primaryKey: string): string {
    return primaryKey;
  }
}
