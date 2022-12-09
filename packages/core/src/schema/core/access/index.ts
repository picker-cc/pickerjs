import { AccessOperation, BaseAccessArgs } from '../../types/config/access-control';
import { BaseListTypeInfo } from '../../types';

export function allowAll() {
  return true;
}
export function denyAll() {
  return false;
}

export function allOperations<ListTypeInfo extends BaseListTypeInfo>(
  func: (args: BaseAccessArgs<ListTypeInfo> & { operation: AccessOperation }) => boolean
) {
  return {
    query: func,
    create: func,
    update: func,
    delete: func
  };
}
