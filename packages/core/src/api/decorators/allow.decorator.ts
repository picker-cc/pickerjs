import {SetMetadata} from '@nestjs/common';
import {Permission} from "@picker-cc/common/lib/generated-types";

export const PERMISSIONS_METADATA_KEY = '__permissions__';

/**
 * @description
 * 使用一个或多个{@link Permission}值将元数据附加到解析器，定义执行操作需要哪些权限。
 *
 * @example
 * ```TypeScript
 *  \@Allow(Permission.SuperAdmin)
 *  \@Query()
 *  getAdministrators() {
 *      // ...
 *  }
 * ```
 *
 * @docsCategory request
 * @docsPage Decorators
 */
export const Allow = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
