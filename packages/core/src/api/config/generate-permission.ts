import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import { GraphQLEnumType, GraphQLSchema } from 'graphql';
import { GraphQLEnumValueConfigMap } from 'graphql/type/definition';

import { getAllPermissionsMetadata } from '../../common/constants';
import { PermissionDefinition } from '../../common/permission-definition';

const PERMISSION_DESCRIPTION = `@description
管理员和客户权限。用于通过 {@link Allow} 装饰器控制对 GraphQL 解析器的访问
@docsCategory common`;

/**
 * 根据默认和自定义权限定义生成 `Permission` GraphQL enum。
 */
export function generatePermissionEnum(
    schema: GraphQLSchema,
    customPermissions: PermissionDefinition[],
): GraphQLSchema {
    const allPermissionsMetadata = getAllPermissionsMetadata(customPermissions);
    const values: GraphQLEnumValueConfigMap = {};
    let i = 0;
    for (const entry of allPermissionsMetadata) {
        values[entry.name] = {
            value: i,
            description: entry.description,
        };
        i++;
    }

    const permissionsEnum = new GraphQLEnumType({
        name: 'Permission',
        description: PERMISSION_DESCRIPTION,
        values,
    });

    return stitchSchemas({
        subschemas: [schema],
        types: [permissionsEnum],
        typeMergingOptions: { validationSettings: { validationLevel: ValidationLevel.Off } },
    });
}
