import {generate} from '@graphql-codegen/cli';
import fs from 'fs';
import {buildClientSchema} from 'graphql';
import path from 'path';

import {
    ADMIN_API_PATH,
    STUDIO_API_PATH,
} from '../../packages/common/src/shared-constants';

import {downloadIntrospectionSchema} from './download-introspection-schema';

const CLIENT_QUERY_FILES = path.join(
    __dirname,
    '../../packages/admin-ui/src/lib/core/src/data/definitions/**/*.ts',
)
const specFileToIgnore = [
    'import.e2e-spec',
    'plugin.e2e-spec',
    'custom-fields.e2e-spec',
    'custom-field-relations.e2e-spec',
    'list-query-builder.e2e-spec',
    'database-transactions.e2e-spec',
    'parallel-transactions.e2e-spec',
    'order-merge.e2e-spec',
    'entity-hydrator.e2e-spec',
]
const E2E_ADMIN_QUERY_FILES = path.join(
    __dirname,
    `../../packages/core/e2e/**/!(${specFileToIgnore.join('|')}).ts`,
);
const E2E_STUDIO_QUERY_FILES = [ path.join(__dirname, '../../packages/core/e2e/graphql/studio-definitions.ts') ];

//
// const E2E_ELASTICSEARCH_PLUGIN_QUERY_FILES = path.join(
//     __dirname,
//     '../../packages/elasticsearch-plugin/e2e/**/*.ts',
// );
// const E2E_ASSET_SERVER_PLUGIN_QUERY_FILES = path.join(
//     __dirname,
//     '../../packages/asset-server-plugin/e2e/**/*.ts',
// );

const ADMIN_SCHEMA_OUTPUT_FILE = path.join(__dirname, '../../schema-admin.json');
const STUDIO_SCHEMA_OUTPUT_FILE = path.join(__dirname, '../../schema-studio.json')

// tslint:disable:no-console

Promise.all([
    downloadIntrospectionSchema(ADMIN_API_PATH, ADMIN_SCHEMA_OUTPUT_FILE),
    // 工作室API
    downloadIntrospectionSchema(STUDIO_API_PATH, STUDIO_SCHEMA_OUTPUT_FILE),
    // 小程序标准版
    // downloadIntrospectionSchema(WEAPP_API_PATH, WEAPP_SCHEMA_OUTPUT_FILE),
    // 小程序企业版
    // downloadIntrospectionSchema(WEAPP_EE_API_PATH, WEAPP_EE_SCHEMA_OUTPUT_FILE),
])
    .then(([ adminSchemaSuccess ]) => {
        // console.log(adminSchemaSuccess)
        if (!adminSchemaSuccess) {
            console.log('试图从现有的模式json文件生成类型...');
        }

        const adminSchemaJson = JSON.parse(fs.readFileSync(ADMIN_SCHEMA_OUTPUT_FILE, 'utf-8'));
        const studioSchemaJson = JSON.parse(fs.readFileSync(STUDIO_SCHEMA_OUTPUT_FILE, 'utf-8'));
        // const weappSchemaJson = JSON.parse(fs.readFileSync(WEAPP_SCHEMA_OUTPUT_FILE, 'utf-8'));
        // const weappEESchemaJson = JSON.parse(fs.readFileSync(WEAPP_EE_SCHEMA_OUTPUT_FILE, 'utf-8'));
        const adminSchema = buildClientSchema(adminSchemaJson.data);
        const studioSchema = buildClientSchema(studioSchemaJson.data);
        // const weappSchema = buildClientSchema(weappSchemaJson.data);
        // const weappEESchema = buildClientSchema(weappEESchemaJson.data);
        const config = {
            namingConvention: {
                enumValues: 'keep',
            },
            strict: true,
        };
        const e2eConfig = {
            ...config,
            skipTypename: true,
        };
        const disableTsLintPlugin = {add: {content: '// tslint:disable'}};
        const graphQlErrorsPlugin = path.join(__dirname, '/plugins/graphql-errors-plugin.ts');
        const commonPlugins = [ disableTsLintPlugin, 'typescript' ];
        const clientPlugins = [ ...commonPlugins, 'typescript-operations', 'typescript-compatibility' ];

        return generate({
            overwrite: true,
            generates: {
                [path.join(__dirname, '../../packages/core/src/common/error/generated-graphql-admin-errors.ts')]: {
                    schema: [ ADMIN_SCHEMA_OUTPUT_FILE ],
                    plugins: [ disableTsLintPlugin, graphQlErrorsPlugin ],
                },
                [path.join(__dirname, '../../packages/core/src/common/error/generated-graphql-studio-errors.ts')]: {
                    schema: [ STUDIO_SCHEMA_OUTPUT_FILE ],
                    plugins: [ disableTsLintPlugin, graphQlErrorsPlugin ],
                },
                // [path.join(__dirname, '../../packages/core/e2e/graphql/generated-e2e-admin-types.ts')]: {
                //     schema: [ ADMIN_SCHEMA_OUTPUT_FILE ],
                //     documents: E2E_ADMIN_QUERY_FILES,
                //     plugins: clientPlugins,
                //     config: e2eConfig,
                // },
                // [path.join(__dirname, '../../packages/core/e2e/graphql/generated-e2e-studio-types.ts')]: {
                //     schema: [ STUDIO_SCHEMA_OUTPUT_FILE ],
                //     documents: E2E_STUDIO_QUERY_FILES,
                //     plugins: clientPlugins,
                //     config: e2eConfig,
                // },
                [path.join(__dirname, '../../packages/common/src/generated-types.ts')]: {
                    schema: [ ADMIN_SCHEMA_OUTPUT_FILE ],
                    plugins: commonPlugins,
                    config: {
                        ...config,
                        scalars: {
                            ID: 'string | number',
                        },
                        maybeValue: 'T',
                    },
                },
                [path.join(__dirname, '../../packages/common/src/generated-studio-types.ts')]: {
                    schema: [ STUDIO_SCHEMA_OUTPUT_FILE ],
                    plugins: commonPlugins,
                    config: {
                        ...config,
                        scalars: {
                            ID: 'string | number',
                        },
                        maybeValue: 'T',
                    },
                },
            },
        });
    })
    .then(
        result => {
            process.exit(0);
        },
        err => {
            console.error(err);
            process.exit(1);
        },
    );
