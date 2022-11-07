import { LanguageCode } from '@picker-cc/common/lib/generated-types';

import { CrudPermissionDefinition, PermissionDefinition, PermissionMetadata } from './permission-definition';

/**
 * 这个值应该很少使用 - 只是确保
 * PickerConfig 至少有一个有效的语言代码可用。
 */
export const DEFAULT_LANGUAGE_CODE = LanguageCode.en;
export const TRANSACTION_MANAGER_KEY = Symbol('TRANSACTION_MANAGER');
export const REQUEST_CONTEXT_KEY = 'PickerRequestContext';
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
    new PermissionDefinition({
        name: 'Authenticated',
        description: 'Authenticated 仅意味着用户已经登录',
        assignable: true,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'SuperAdmin',
        description: 'SuperAdmin 可以不受限制地进入所有操作',
        assignable: true,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'Owner',
        description: `Owner 指用户拥有该实体，例如客户自己的订单`,
        assignable: false,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'Public',
        description: `Public 表示任何未经身份验证的用户都可能执行该操作`,
        assignable: false,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'UpdateGlobalSettings',
        description: `授权更新 GlobalSettings`,
        assignable: true,
        internal: false,
    }),
    new CrudPermissionDefinition(
        'Catalog',
        operation => `授权限给 ${operation} Assets, Collections`,
    ),
    new CrudPermissionDefinition(
        'Settings',
        operation =>
            `授权限给 ${operation} System & GlobalSettings`,
    ),
    new CrudPermissionDefinition('Administrator'),
    new CrudPermissionDefinition('Asset'),
    new CrudPermissionDefinition('System'),
    new CrudPermissionDefinition('Product'),
    new CrudPermissionDefinition('Post'),
    new CrudPermissionDefinition('Tag'),
];

export function getAllPermissionsMetadata(customPermissions: PermissionDefinition[]): PermissionMetadata[] {
    const allPermissions = [...DEFAULT_PERMISSIONS, ...customPermissions];
    return allPermissions.reduce((all, def) => [...all, ...def.getMetadata()], [] as PermissionMetadata[]);
}
