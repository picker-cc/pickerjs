import pLimit from 'p-limit';
import {PickerConfig} from "./config";
import {initialiseLists} from "./schema/types-for-lists";
import {getGqlNames, SchemaConfig} from "./schema/types";
import {createGraphQLSchema} from "./schema/createGraphQLSchema";
import {getSudoGraphQLSchema} from "./schema/core/graphql-schema";
import {PrismaModule} from "./schema/artifacts";
import {setPrismaNamespace, setWriteLimit} from "./schema/core/mutations/create-update";
import {makeCreateContext} from "./schema/context/createContext";


export function createSystem(config: SchemaConfig, isLiveReload?: boolean) {
    const lists = initialiseLists(config);

    const graphQLSchema = createGraphQLSchema(config, lists);

    const sudoGraphQLSchema = getSudoGraphQLSchema(config);

    return {
        graphQLSchema,
        getPicker: (prismaModule: PrismaModule) => {
            const prismaClient = new prismaModule.PrismaClient({
                log: config.db.enableLogging ? ['query'] : undefined,
                datasources: { [config.db.provider]: { url: config.db.url } },
            });
            setWriteLimit(prismaClient, pLimit(config.db.provider === 'sqlite' ? 1 : Infinity));
            setPrismaNamespace(prismaClient, prismaModule.Prisma);
            prismaClient.$on('beforeExit', async () => {
                // Prisma 无法正确清理它的子进程
                // 我们在退出时显示地向 prisma 子进程发送 SIGINT 信号，以确保该进程被适当清理
                prismaClient._engine.child?.kill('SIGINT');
            });

            const createContext = makeCreateContext({
                graphQLSchema,
                sudoGraphQLSchema,
                config,
                prismaClient,
                gqlNamesByList: Object.fromEntries(
                    Object.entries(lists).map(([listKey, list]) => [listKey, getGqlNames(list)])
                ),
                lists,
            });

            return {
                async connect() {
                    if (!isLiveReload) {
                        await prismaClient.$connect();
                        const context = createContext({ sudo: true });
                        await config.db.onConnect?.(context);
                    }
                },
                async disconnect() {
                    // Tests that use the stored session won't stop until the store connection is disconnected
                    await config?.session?.disconnect?.();
                    await prismaClient.$disconnect();
                },
                createContext,
            };
        },
    };
}
