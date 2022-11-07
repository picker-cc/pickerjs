import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import {
    buildASTSchema,
    GraphQLInputFieldConfigMap,
    GraphQLInputObjectType,
    GraphQLSchema,
    isInputObjectType,
} from 'graphql';

import { InternalServerError } from '../../common/error/errors';
import { AuthenticationStrategy } from '../../config/auth/authentication-strategy';

/**
 * 这个函数负责构造 GraphQL 输入类型 `AuthenticationInput`。
 * 它基于已配置的 AuthenticationStrategy defineInputType 定义的输入来执行此操作，动态构建一个格式为:
 *
 *```
 * {
 *     [strategy_name]: strategy_input_type
 * }
 * ```
 */
export function generateAuthenticationTypes(
    schema: GraphQLSchema,
    authenticationStrategies: AuthenticationStrategy[],
): GraphQLSchema {
    const fields: GraphQLInputFieldConfigMap = {};
    const strategySchemas: GraphQLSchema[] = [];
    for (const strategy of authenticationStrategies) {
        const inputSchema = buildASTSchema(strategy.defineInputType());

        const inputType = Object.values(
            inputSchema.getTypeMap(),
        ).find((type): type is GraphQLInputObjectType => isInputObjectType(type));
        if (!inputType) {
            throw new InternalServerError(
                `${strategy.constructor.name}.defineInputType() does not define a GraphQL Input type`,
            );
        }
        fields[strategy.name] = { type: inputType };
        strategySchemas.push(inputSchema);
    }
    const authenticationInput = new GraphQLInputObjectType({
        name: 'AuthenticationInput',
        fields,
    });

    return stitchSchemas({
        subschemas: [schema, ...strategySchemas],
        types: [authenticationInput],
        typeMergingOptions: { validationSettings: { validationLevel: ValidationLevel.Off } },
    });
}
