import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import { notNullOrUndefined } from '@picker-cc/common/lib/shared-utils';
import {
    GraphQLEnumType,
    GraphQLField,
    GraphQLInputField,
    GraphQLInputFieldConfig,
    GraphQLInputFieldConfigMap,
    GraphQLInputObjectType,
    GraphQLInputType,
    GraphQLInt,
    GraphQLNamedType,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLSchema, GraphQLType,
    isEnumType,
    isInputObjectType,
    isListType,
    isNonNullType,
    isObjectType,
} from 'graphql/type';
import { buildSchema } from 'graphql/utilities';

/**
 * 为返回 PaginatedList 类型的查询生成 ListOptions 输入。
 */
export function generateListOptions(typeDefsOrSchema: string | GraphQLSchema): GraphQLSchema {
    const schema = typeof typeDefsOrSchema === 'string' ? buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    const queryType = schema.getQueryType();
    if (!queryType) {
        return schema;
    }
    const logicalOperatorEnum = schema.getType('LogicalOperator');
    const objectTypes = Object.values(schema.getTypeMap()).filter(isObjectType);

    const allFields = objectTypes.reduce((fields, type) => {
        const typeFields = Object.values(type.getFields()).filter(f => isListQueryType(f.type));
        return [...fields, ...typeFields];
    }, [] as Array<GraphQLField<any, any>>);
    const generatedTypes: GraphQLNamedType[] = [];

    for (const query of allFields) {
        const targetTypeName = unwrapNonNullType(query.type).toString().replace(/List$/, '');
        const targetType = schema.getType(targetTypeName);
        if (targetType && isObjectType(targetType)) {
            const sortParameter = createSortParameter(schema, targetType);
            const filterParameter = createFilterParameter(schema, targetType);
            const existingListOptions = schema.getType(
                `${targetTypeName}ListOptions`,
            ) as GraphQLInputObjectType | null;
            const generatedListOptions = new GraphQLInputObjectType({
                name: `${targetTypeName}ListOptions`,
                fields: {
                    skip: {
                        type: GraphQLInt,
                        description: '跳过前n个结果以用于分页',
                    },
                    take: { type: GraphQLInt, description: '获取n个结果，用于分页' },
                    sort: {
                        type: sortParameter,
                        description: '指定根据哪些属性对结果进行排序',
                    },
                    filter: { type: filterParameter, description: '允许过滤结果' },
                    ...(logicalOperatorEnum
                        ? {
                            filterOperator: {
                                type: logicalOperatorEnum as GraphQLEnumType,
                                description:
                                    '指定多个 "filters" 参数是否应该与逻辑的 AND 或 OR 操作组合，默认为 AND',
                            },
                        }
                        : {}),
                    ...(existingListOptions ? existingListOptions.getFields() : {}),
                },
            });

            if (!query.args.find(a => a.type.toString() === `${targetTypeName}ListOptions`)) {
                query.args.concat({
                    name: 'options',
                    type: generatedListOptions,
                    description: null,
                    defaultValue: null,
                    extensions: null,
                    astNode: null,
                    deprecationReason: null,
                })
                // query.args.push({
                //     name: 'options',
                //     type: generatedListOptions,
                //     description: null,
                //     defaultValue: null,
                //     extensions: null,
                //     astNode: null,
                //     deprecationReason: null,
                // });
            }

            generatedTypes.push(filterParameter);
            generatedTypes.push(sortParameter);
            generatedTypes.push(generatedListOptions);
        }
    }
    return stitchSchemas({
        subschemas: [schema],
        types: generatedTypes,
        typeMergingOptions: { validationSettings: { validationLevel: ValidationLevel.Off } },
    });
}

function isListQueryType(type: GraphQLOutputType): type is GraphQLObjectType {
    const innerType = unwrapNonNullType(type);
    return isObjectType(innerType) && !!innerType.getInterfaces().find(i => i.name === 'PaginatedList');
}

function createSortParameter(schema: GraphQLSchema, targetType: GraphQLObjectType) {
    const fields: Array<GraphQLField<any, any> | GraphQLInputField> = Object.values(targetType.getFields());
    const targetTypeName = targetType.name;
    const SortOrder = schema.getType('SortOrder') as GraphQLEnumType;

    const inputName = `${targetTypeName}SortParameter`;
    const existingInput = schema.getType(inputName);
    if (isInputObjectType(existingInput)) {
        fields.push(...Object.values(existingInput.getFields()));
    }

    const sortableTypes = ['ID', 'String', 'Int', 'Float', 'DateTime'];
    return new GraphQLInputObjectType({
        name: inputName,
        fields: fields
            .map(field => {
                if (unwrapNonNullType(field.type) === SortOrder) {
                    return field;
                } else {
                    return sortableTypes.includes(unwrapNonNullType(field.type).toString()) ? field : undefined;
                }
            })
            .filter(notNullOrUndefined)
            .reduce((result, field) => {
                const fieldConfig: GraphQLInputFieldConfig = {
                    type: SortOrder,
                };
                return {
                    ...result,
                    [field.name]: fieldConfig,
                };
            }, {} as GraphQLInputFieldConfigMap),
    });
}

function createFilterParameter(schema: GraphQLSchema, targetType: GraphQLObjectType): GraphQLInputObjectType {
    const fields: Array<GraphQLField<any, any> | GraphQLInputField> = Object.values(targetType.getFields());
    const targetTypeName = targetType.name;
    const { StringOperators, BooleanOperators, NumberOperators, DateOperators } = getCommonTypes(schema);

    const inputName = `${targetTypeName}FilterParameter`;
    const existingInput = schema.getType(inputName);
    if (isInputObjectType(existingInput)) {
        fields.push(...Object.values(existingInput.getFields()));
    }

    return new GraphQLInputObjectType({
        name: inputName,
        fields: fields.reduce((result, field) => {
            const fieldType = field.type;
            const filterType = isInputObjectType(fieldType) ? fieldType : getFilterType(field);
            if (!filterType) {
                return result;
            }
            const fieldConfig: GraphQLInputFieldConfig = {
                type: filterType,
            };
            return {
                ...result,
                [field.name]: fieldConfig,
            };
        }, {} as GraphQLInputFieldConfigMap),
    });

    function getFilterType(field: GraphQLField<any, any> | GraphQLInputField): GraphQLInputType | undefined {
        if (isListType(field.type)) {
            return;
        }
        const innerType = unwrapNonNullType(field.type);
        if (isEnumType(innerType)) {
            return StringOperators;
        }
        switch (innerType.toString()) {
            case 'String':
                return StringOperators;
            case 'Boolean':
                return BooleanOperators;
            case 'Int':
            case 'Float':
                return NumberOperators;
            case 'DateTime':
                return DateOperators;
            default:
                return;
        }
    }
}

function getCommonTypes(schema: GraphQLSchema) {
    const SortOrder = schema.getType('SortOrder') as GraphQLEnumType | null;
    const StringOperators = schema.getType('StringOperators') as GraphQLInputType | null;
    const BooleanOperators = schema.getType('BooleanOperators') as GraphQLInputType | null;
    const NumberRange = schema.getType('NumberRange') as GraphQLInputType | null;
    const NumberOperators = schema.getType('NumberOperators') as GraphQLInputType | null;
    const DateRange = schema.getType('DateRange') as GraphQLInputType | null;
    const DateOperators = schema.getType('DateOperators') as GraphQLInputType | null;
    if (
        !SortOrder ||
        !StringOperators ||
        !BooleanOperators ||
        !NumberRange ||
        !NumberOperators ||
        !DateRange ||
        !DateOperators
    ) {
        throw new Error(`未定义通用类型`);
    }
    return {
        SortOrder,
        StringOperators,
        BooleanOperators,
        NumberOperators,
        DateOperators,
    };
}

/**
 * Unwraps the inner type if it is inside a non-nullable type
 */
function unwrapNonNullType(type: GraphQLOutputType | GraphQLInputType): GraphQLType {
    if (isNonNullType(type)) {
        return type.ofType
    }
    return type;
}
