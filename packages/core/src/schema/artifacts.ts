import path from 'path';
import * as fs from 'fs-extra';

import {formatSchema, getGenerator} from "@prisma/internals";
import { format } from 'prettier';
import {GraphQLSchema, printSchema} from "graphql";
import {initialiseLists} from "./types-for-lists";
import {printPrismaSchema} from "./prisma/prisma-schema";
import { createRequire } from 'module';
import {printGeneratedTypes} from "./schema-type-printer";
import {SchemaConfig} from "./types";
import {confirmPrompt, shouldPrompt} from "./prompts";
import {ExitError} from "./utils";

export function getSchemaPaths(cwd: string) {
    return {
        prisma: path.join(cwd, 'schema.prisma'),
        graphql: path.join(cwd, 'schema.graphql'),
    };
}


type CommittedArtifacts = {
    graphql: string;
    prisma: string;
};

export function getFormattedGraphQLSchema(schema: string) {
    return format(
        '# 该文件由 Picker 自动生成，请勿手动修改。当您需要修改 Picker 配置时，请修改 Picker config。\n\n' +
        schema,
        { parser: 'graphql' }
    );
}

export async function getCommittedArtifacts(
    graphQLSchema: GraphQLSchema,
    config: SchemaConfig
): Promise<CommittedArtifacts> {
    const lists = initialiseLists(config);
    const prismaSchema = printPrismaSchema(
        lists,
        config.db.provider,
        config.db.prismaPreviewFeatures,
        config.db.additionalPrismaDatasourceProperties
    );
    return {
        graphql: getFormattedGraphQLSchema(printSchema(graphQLSchema)),
        prisma: await formatPrismaSchema(prismaSchema),
    };
}

let hasEnsuredBinariesExist = false;
async function ensurePrismaBinariesExist() {
    // ensureBinariesExist does a bunch of slightly expensive things
    // so if we can avoid running it a bunch in tests, that's ideal
    if (hasEnsuredBinariesExist) return;
    // we're resolving @prisma/engines from @prisma/internals
    // because we don't want to depend on @prisma/engines
    // since its version includes a commit hash from https://github.com/prisma/prisma-engines
    // and we just want to use whatever version @prisma/internals is using
    // also note we use an exact version of @prisma/internals
    // so if @prisma/internals suddenly stops depending on @prisma/engines
    // that won't break a released version of Keystone
    // also, we're not just directly importing @prisma/engines
    // since stricter package managers(e.g. pnpm, Yarn Berry)
    // don't allow importing packages that aren't explicitly depended on
    const requireFromPrismaSdk = createRequire(require.resolve('@prisma/internals'));
    const prismaEngines = requireFromPrismaSdk('@prisma/engines') as typeof import('@prisma/engines');
    await prismaEngines.ensureBinariesExist();
    hasEnsuredBinariesExist = true;
}

async function formatPrismaSchema(schema: string) {
    await ensurePrismaBinariesExist();
    return formatSchema({ schema });
}

async function readFileButReturnNothingIfDoesNotExist(filename: string) {
    try {
        return await fs.readFile(filename, 'utf8');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return;
        }
        throw err;
    }
}

export async function validateCommittedArtifacts(
    graphQLSchema: GraphQLSchema,
    config: SchemaConfig,
    cwd: string
) {
    const artifacts = await getCommittedArtifacts(graphQLSchema, config);
    const schemaPaths = getSchemaPaths(cwd);
    const [writtenGraphQLSchema, writtenPrismaSchema] = await Promise.all([
        readFileButReturnNothingIfDoesNotExist(schemaPaths.graphql),
        readFileButReturnNothingIfDoesNotExist(schemaPaths.prisma),
    ]);
    const outOfDateSchemas = (() => {
        if (writtenGraphQLSchema !== artifacts.graphql && writtenPrismaSchema !== artifacts.prisma) {
            return 'both';
        }
        if (writtenGraphQLSchema !== artifacts.graphql) {
            return 'graphql';
        }
        if (writtenPrismaSchema !== artifacts.prisma) {
            return 'prisma';
        }
    })();
    if (outOfDateSchemas) {
        const message = {
            both: '您的 Prisma 和 GraphQL 的 schema 不是最新的',
            graphql: '您的 GraphQL schema 不是最新的',
            prisma: '您的 Prisma schema 不是最新的',
        }[outOfDateSchemas];
        console.log(message);
        const term = {
            both: 'Prisma 和 GraphQL schemas',
            prisma: 'Prisma schema',
            graphql: 'GraphQL schema',
        }[outOfDateSchemas];
        if (shouldPrompt && (await confirmPrompt(`你要更新 ${term} 吗?`))) {
            await writeCommittedArtifacts(artifacts, cwd);
        } else {
            console.log(`请运行 picker postinstall --fix 更新您的 ${term}`);
            throw new ExitError(1);
        }
    }
}


export async function writeCommittedArtifacts(artifacts: CommittedArtifacts, cwd: string) {
    const schemaPaths = getSchemaPaths(cwd);
    await Promise.all([
        fs.writeFile(schemaPaths.graphql, artifacts.graphql),
        fs.writeFile(schemaPaths.prisma, artifacts.prisma),
    ]);
}
export async function generateCommittedArtifacts(
    graphQLSchema: GraphQLSchema,
    config: SchemaConfig,
    cwd: string
) {
    const artifacts = await getCommittedArtifacts(graphQLSchema, config);
    await writeCommittedArtifacts(artifacts, cwd);
    return artifacts;
}

const nodeAPIJS = (
    cwd: string,
    config: SchemaConfig
) => `import SchemaConfig from '../../picker-cc';
import { PrismaClient } from '.prisma/client';
import { createQueryAPI } from '@picker-cc/core/___internal-do-not-use-will-break-in-patch/node-api';

export const query = createQueryAPI(SchemaConfig, PrismaClient);
`;

const nodeAPIDTS = `import { PickerListsAPI } from '@picker-cc/core/types';
import { Context } from './types';

export const query: Context['query'];`;

export async function generateNodeModulesArtifactsWithoutPrismaClient(
    graphQLSchema: GraphQLSchema,
    config: SchemaConfig,
    cwd: string
) {
    const lists = initialiseLists(config);

    const dotPickerDir = path.join(cwd, 'node_modules/.picker');

    console.log(dotPickerDir)
    await Promise.all([
        fs.outputFile(
            path.join(dotPickerDir, 'types.d.ts'),
            printGeneratedTypes(graphQLSchema, lists)
        ),
        fs.outputFile(path.join(dotPickerDir, 'types.js'), ''),
        ...(config.experimental?.generateNodeAPI
            ? [
                fs.outputFile(path.join(dotPickerDir, 'api.js'), nodeAPIJS(cwd, config)),
                fs.outputFile(path.join(dotPickerDir, 'api.d.ts'), nodeAPIDTS),
            ]
            : []
        ),
    ]);
}

export async function generateNodeModulesArtifacts(
    graphQLSchema: GraphQLSchema,
    config: SchemaConfig,
    cwd: string
) {
    await Promise.all([
        generatePrismaClient(cwd),
        generateNodeModulesArtifactsWithoutPrismaClient(graphQLSchema, config, cwd),
    ]);
}

async function generatePrismaClient(cwd: string) {
    const generator = await getGenerator({
        schemaPath: getSchemaPaths(cwd).prisma,
        dataProxy: false,
    });
    try {
        await generator.generate();
    } finally {
        let closePromise = new Promise<void>(resolve => {
            const child = (generator as any).generatorProcess
                .child as import('child_process').ChildProcess;
            child.once('exit', () => {
                resolve();
            });
        });
        generator.stop();
        await closePromise;
    }
}

export type PrismaModule = {
    PrismaClient: {
        new (args: unknown): any;
    };
    Prisma: { DbNull: unknown; JsonNull: unknown; [key: string]: unknown };
};

export function requirePrismaClient(cwd: string): PrismaModule {
    return require(path.join(cwd, 'node_modules/.prisma/client'));
}
