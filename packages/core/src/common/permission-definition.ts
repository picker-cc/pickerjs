import { Permission } from '@picker-cc/common/lib/generated-types';

/**
 * @description
 * 配置 {@link PermissionDefinition}
 *
 * @docsCategory auth
 * @docsPage PermissionDefinition
 */
export interface PermissionDefinitionConfig {
    /**
     * @description
     * 权限名，按照惯例，应该是这样的
     * UpperCamelCased
     */
    name: string;
    /**
     * @description
     * 权限描述
     */
    description?: string;
    /**
     * @description
     * 定义该权限是否可以分配给角色。一般来说这个除非在特殊情况下，应该保留为默认为 `true`
     *
     * @default true
     */
    assignable?: boolean;
    /**
     * @description
     * 内部权限不会通过 API 暴露，而是保留给特殊的用例，如在 `Owner` 或 `Public` 权限。
     *
     * @default false
     */
    internal?: boolean;
}

/**
 * @description
 * 在生成 GraphQL `Permissions` enum。
 *
 * @internal
 */
export type PermissionMetadata = Required<PermissionDefinitionConfig>;

/**
 * @description
 * 定义一个新的权限来控制给 GraphQL resolvers 和 REST controllers 访问。
 * 与 {@link Allow} decorator 一起使用(见下方示例).
 *
 * **Note:** 定义 CRUD permissions, 使用 {@link CrudPermissionDefinition}.
 *
 * @example
 * ```TypeScript
 * export const sync = new PermissionDefinition({
 *   name: 'SyncInventory',
 *   description: 'Allows syncing stock levels via Admin API'
 * });
 * ```
 *
 * ```TypeScript
 * const config: PickerConfig = {
 *   authOptions: {
 *     customPermissions: [sync],
 *   },
 * }
 * ```
 *
 * ```TypeScript
 * \@Resolver()
 * export class ExternalSyncResolver {
 *
 *   \@Allow(sync.Permission)
 *   \@Mutation()
 *   syncStockLevels() {
 *     // ...
 *   }
 * }
 * ```
 * @docsCategory auth
 * @docsPage PermissionDefinition
 * @docsWeight 0
 */
export class PermissionDefinition {
    constructor(protected config: PermissionDefinitionConfig) {}

    /** @internal */
    getMetadata(): PermissionMetadata[] {
        const { name, description, assignable, internal } = this.config;
        return [
            {
                name,
                // 授权 name 操作权限
                description: description || `Grants permissions on ${name} operations`,
                assignable: assignable ?? true,
                internal: internal ?? false,
            },
        ];
    }

    /**
     * @description
     * 返回权限的定义用于
     * {@link Allow} decorator.
     */
    get Permission(): Permission {
        return this.config.name as Permission;
    }
}

/**
 * @description
 * 为给定的名称定义一组 CRUD 权限，例如创建一个 `name` 为 `Wishlist`
 * 将会定义出 4 种权限:'CreateWishlist', 'ReadWishlist', 'UpdateWishlist' & 'DeleteWishlist'.
 *
 * @example
 * ```TypeScript
 * export const wishlist = new CrudPermissionDefinition('Wishlist');
 * ```
 *
 * ```TypeScript
 * const config: PickerConfig = {
 *   authOptions: {
 *     customPermissions: [wishlist],
 *   },
 * }
 * ```
 *
 * ```TypeScript
 * \@Resolver()
 * export class WishlistResolver {
 *
 *   \@Allow(wishlist.Create)
 *   \@Mutation()
 *   createWishlist() {
 *     // ...
 *   }
 * }
 * ```
 *
 * @docsCategory auth
 * @docsPage PermissionDefinition
 * @docsWeight 1
 */
export class CrudPermissionDefinition extends PermissionDefinition {
    constructor(
        name: string,
        private descriptionFn?: (operation: 'create' | 'read' | 'update' | 'delete') => string,
    ) {
        super({ name });
    }

    /** @internal */
    getMetadata(): PermissionMetadata[] {
        return ['Create', 'Read', 'Update', 'Delete'].map(operation => ({
            name: `${operation}${this.config.name}`,
            description:
                typeof this.descriptionFn === 'function'
                    ? this.descriptionFn(operation.toLocaleLowerCase() as any)
                    : `授权限给 ${operation.toLocaleLowerCase()} ${this.config.name}`,
            assignable: true,
            internal: false,
        }));
    }

    /**
     * @description
     * 返回定义的 'Create' CRUD 权限用于
     * {@link Allow} decorator.
     */
    get Create(): Permission {
        return `Create${this.config.name}` as Permission;
    }

    /**
     * @description
     * 返回定义的 'Read' CRUD 权限用于
     * {@link Allow} decorator.
     */
    get Read(): Permission {
        return `Read${this.config.name}` as Permission;
    }

    /**
     * @description
     * 返回定义的 'Update' CRUD 权限用于
     * {@link Allow} decorator.
     */
    get Update(): Permission {
        return `Update${this.config.name}` as Permission;
    }

    /**
     * @description
     * 返回定义的 'Delete' CRUD 权限用于
     * {@link Allow} decorator.
     */
    get Delete(): Permission {
        return `Delete${this.config.name}` as Permission;
    }
}
