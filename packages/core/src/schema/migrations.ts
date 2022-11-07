import path from 'path';
import {createDatabase, uriToCredentials, DatabaseCredentials} from '@prisma/internals';
import {Migrate} from '@prisma/migrate';
import chalk from 'chalk';
// import slugify from '@sindresorhus/slugify';
import slugify from 'limax';

import {confirmPrompt, textPrompt} from './prompts';
import prompts from "prompts";
import {ExitError} from "./utils";

// 注意，️对于每个 Migrate 实例我们只运行一次，但是我们将对所有 Migrate 调用一致地执行操作，以便调用可以自由使用

// 屏蔽来自 Prisma 的可用更新信息，因为在这个应用程序中不需要开发者使用他们自己的 Prisma 版本
// https://www.prisma.io/docs/reference/api-reference/environment-variables-reference#prisma_hide_update_message
function runMigrateWithDbUrl<T>(dbUrl: string, shadowDbUrl: string | undefined, cb: () => T): T {
    let prevDBURLFromEnv = process.env.DATABASE_URL;
    let prevShadowDBURLFromEnv = process.env.SHADOW_DATABASE_URL;
    let prevHiddenUpdateMessage = process.env.PRISMA_HIDE_UPDATE_MESSAGE;
    try {
        process.env.DATABASE_URL = dbUrl;
        setOrRemoveEnvVariable('SHADOW_DATABASE_URL', shadowDbUrl);
        process.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';
        return cb();
    } finally {
        setOrRemoveEnvVariable('DATABASE_URL', prevDBURLFromEnv);
        setOrRemoveEnvVariable('SHADOW_DATABASE_URL', prevShadowDBURLFromEnv);
        setOrRemoveEnvVariable('PRISMA_HIDE_UPDATE_MESSAGE', prevHiddenUpdateMessage);
    }
}

function setOrRemoveEnvVariable(name: string, value: string | undefined) {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}

async function withMigrate<T>(
    dbUrl: string,
    schemaPath: string,
    cb: (migrate: Migrate) => Promise<T>
) {
    await ensureDatabaseExists(dbUrl, path.dirname(schemaPath));
    const migrate = new Migrate(schemaPath);

    try {
        return await cb(migrate);
    } finally {
        let closePromise = new Promise<void>(resolve => {
            const child = (migrate.engine as any).child as import('child_process').ChildProcess;
            child.once('exit', () => {
                resolve();
            });
        });
        migrate.stop();
        await closePromise;
    }
}

export async function pushPrismaSchemaToDatabase(
    dbUrl: string,
    shadowDbUrl: string | undefined,
    schema: string,
    schemaPath: string,
    shouldDropDatabase = false
) {
    let before = Date.now();

    let migration = await withMigrate(dbUrl, schemaPath, async migrate => {
        if (shouldDropDatabase) {
            await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.engine.reset());
            let migration = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
                migrate.engine.schemaPush({
                    force: true,
                    schema,
                })
            );
            if (!process.env.TEST_ADAPTER) {
                console.log('✨ 您的数据库已被重置');
            }
            return migration;
        }
        // migrate.engine.schemaPush 的 force 是什么意思？
        // - true：忽略警告，但如果有不可执行的步骤，则不会运行任何东西（因此数据库需要在此之前重置）
        // - false：如果有警告或不可执行的步骤，则不运行迁移
        // https://github.com/prisma/prisma-engines/blob/a2de6b71267b45669d25c3a27ad30998862a275c/migration-engine/core/src/commands/schema_push.rs
        let migration = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
            migrate.engine.schemaPush({
                force: false,
                schema,
            })
        );

        // 如果有不可执行的步骤，我们需要重置数据库，或者用户可以切换到使用 Migrate，
        // 在询问是否可以重置数据库之后
        //
        if (migration.unexecutable.length) {
            logUnexecutableSteps(migration.unexecutable);
            if (migration.warnings.length) {
                logWarnings(migration.warnings);
            }
            console.log('\n要执行迁移操作，我们需要重置数据库');
            console.log(
                '如果你想在数据库中保留数据，请在 config 中设置 db.useMigrations 为 true',
            );
            if (
                !(await confirmPrompt(
                    `您想继续吗? ${chalk.red('所有数据将清除')}.`,
                    false
                ))
            ) {
                console.log('数据库重置取消.');
                throw new ExitError(0);
            }
            await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.reset());
            return runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
                migrate.engine.schemaPush({
                    force: false,
                    schema,
                })
            );
        }
        if (migration.warnings.length) {
            logWarnings(migration.warnings);
            if (
                !(await confirmPrompt(
                    `您想继续吗? ${chalk.red('一些数据可能会丢失')}.`,
                    false
                ))
            ) {
                console.log('数据库 Push 取消.');
                throw new ExitError(0);
            }
            return runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
                migrate.engine.schemaPush({
                    force: true,
                    schema,
                })
            );
        }

        return migration;
    });

    if (!process.env.TEST_ADAPTER) {
        if (migration.warnings.length === 0 && migration.executedSteps === 0) {
            console.info(`✨ 数据库已与 Prisma schema 同步。`);
        } else {
            console.info(
                `✨ 数据库现在已与 schema 保持同步。完成于 ${formatms(Date.now() - before)}`
            );
        }
    }
}

function logUnexecutableSteps(unexecutableSteps: string[]) {
    console.log(`${chalk.bold.red('\n⚠️ 我们无法执行:\n')}`);
    for (const item of unexecutableSteps) {
        console.log(`  • ${item}`);
    }
}

function logWarnings(warnings: string[]) {
    console.log(chalk.bold(`\n⚠️  警告:\n`));
    for (const warning of warnings) {
        console.log(`  • ${warning}`);
    }
}

// TODO: don't have process.exit calls here
export async function devMigrations(
    dbUrl: string,
    shadowDbUrl: string | undefined,
    prismaSchema: string,
    schemaPath: string,
    shouldDropDatabase: boolean
) {
    return withMigrate(dbUrl, schemaPath, async migrate => {
        if (!migrate.migrationsDirectoryPath) {
            console.log('没有提供迁移目录.');
            throw new ExitError(1);
        }
        const {migrationsDirectoryPath} = migrate;

        if (shouldDropDatabase) {
            await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.reset());
            if (!process.env.TEST_ADAPTER) {
                console.log('✨ 你的数据库已重置');
            }
        } else {
            // 查看是否需要重置数据库
            // 注意 devDiagnostic 可能返回的另一个操作是 createMigration，
            // 这并不一定意味着我们需要创建一个迁移，它只意味着我们不需要重置数据库
            const devDiagnostic = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
                migrate.devDiagnostic()
            );
            // when the action is reset, the database is somehow inconsistent with the migrations so we need to reset it
            // (not just some migrations need to be applied but there's some inconsistency)
            // 当操作被重置时，数据库与迁移不致，所以我们需要重置它
            // (不只是需要应用一些迁移，而是有一些不一致)
            if (devDiagnostic.action.tag === 'reset') {
                const credentials = uriToCredentials(dbUrl);
                console.log(`${devDiagnostic.action.reason}

我们需要重置 ${credentials.type} database "${credentials.database}" 在 ${getDbLocation(
                    credentials
                )}.`);
                const confirmedReset = await confirmPrompt(
                    `您想继续吗? ${chalk.red('所有数据将清除')}.`
                );
                console.info(); // empty line

                if (!confirmedReset) {
                    console.info('重置取消.');
                    throw new ExitError(0);
                }

                // Do the reset
                await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.reset());
            }
        }
        let {appliedMigrationNames} = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
            migrate.applyMigrations()
        );
        // Inform user about applied migrations now
        if (appliedMigrationNames.length) {
            console.info(
                `✨ 已经应用了以下迁移:\n\n${printFilesFromMigrationIds(
                    appliedMigrationNames
                )}`
            );
        }
        // evaluateDataLoss basically 意思是 "尝试创建迁移，但不进行写入"
        // 这样我们就可以告诉用户它是否可以执行以及是否会有数据丢失
        const evaluateDataLossResult = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
            migrate.evaluateDataLoss()
        );
        // 如果没有步骤，则表示没有对 prisma schema 进行更改，因此不需要创建迁移
        if (evaluateDataLossResult.migrationSteps) {
            console.log('✨ 您的 Picker 模式发生了更改，需要进行迁移');
            const migrationCanBeApplied = !evaluateDataLossResult.unexecutableSteps.length;

            // 查看下面的链接，了解什么是 "unexecutable steps" 不可执行步骤
            // https://github.com/prisma/prisma-engines/blob/c65d20050f139a7917ef2efc47a977338070ea61/migration-engine/connectors/sql-migration-connector/src/sql_destructive_change_checker/unexecutable_step_check.rs
            // the tl;dr is "making things non null when there are nulls in the db"
            // 当数据库中有空值时，设置为非空值
            if (!migrationCanBeApplied) {
                logUnexecutableSteps(evaluateDataLossResult.unexecutableSteps.map((x: any) => x.message));
            }
            // warnings 意味着 "如果迁移应用到您所连接的数据库，您将丢失 x 个数据"
            // 注意，如果你有一个字段，其中所有的值在你的本地数据库是空的，并且已经删除了它，就不会得到警告
            // 在生成的迁移中会有一个注释警告。
            if (evaluateDataLossResult.warnings.length) {
                logWarnings(evaluateDataLossResult.warnings.map(x => x.message));
            }

            console.log(); // for an empty line

            const migrationName = await getMigrationName();
            //
            // 注意，这只会创建迁移，而不会应用它
            let {generatedMigrationName} = await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () =>
                migrate.createMigration({
                    migrationsDirectoryPath,
                    // https://github.com/prisma/prisma-engines/blob/11dfcc85d7f9b55235e31630cd87da7da3aed8cc/migration-engine/core/src/commands/create_migration.rs#L16-L17
                    // draft 表示 "即使没有更改，也要创建空迁移"
                    // 因为整体过程只会在模式发生变化时发生
                    draft: false,
                    prismaSchema,
                    migrationName,
                })
            );

            console.log(`✨ 在迁移过程中已创建了迁移/${generatedMigrationName}`);

            const shouldApplyMigration =
                migrationCanBeApplied &&
                (await confirmPrompt('您想应用此迁移吗?', false));

            if (shouldApplyMigration) {
                await runMigrateWithDbUrl(dbUrl, shadowDbUrl, () => migrate.applyMigrations());
                console.log('✅ 迁移已经被应用。');
            } else {
                console.log('请修改迁移并再次运行 picker dev 以应用迁移');
                throw new ExitError(0);
            }
        } else {
            if (appliedMigrationNames.length) {
                console.log('✨ 您的迁移是最新的，不需要创建新的迁移');
            } else {
                console.log('✨ 您的数据库是最新的，不需要创建或应用迁移');
            }
        }
    });
}

// based on https://github.com/prisma/prisma/blob/3fed5919545bfae0a82d35134a4f1d21359118cb/src/packages/migrate/src/utils/promptForMigrationName.ts
const MAX_MIGRATION_NAME_LENGTH = 200;

async function getMigrationName() {
    let migrationName = await textPrompt('迁移名称');
    return slugify(migrationName, {separator: '_'}).substring(0, MAX_MIGRATION_NAME_LENGTH);
}

function printFilesFromMigrationIds(migrationIds: string[]) {
    return `migrations/\n${migrationIds
        .map(migrationId => `  └─ ${printMigrationId(migrationId)}/\n    └─ migration.sql`)
        .join('\n')}`;
}

function printMigrationId(migrationId: string): string {
    const words = migrationId.split('_');
    if (words.length === 1) {
        return chalk.cyan.bold(migrationId);
    }
    return `${words[0]}_${chalk.cyan.bold(words.slice(1).join('_'))}`;
}

async function ensureDatabaseExists(dbUrl: string, schemaDir: string) {
    // createDatabase will return false when the database already exists
    const created = await createDatabase(dbUrl, schemaDir);
    if (created) {
        const credentials = uriToCredentials(dbUrl);
        if (!process.env.TEST_ADAPTER) {
            console.log(
                `✨ ${credentials.type} database "${credentials.database}" created at ${getDbLocation(
                    credentials
                )}`
            );
        }
    }
    // TODO: handle createDatabase returning a failure (prisma's cli does not handle it though so not super worried)
}

function getDbLocation(credentials: DatabaseCredentials): string {
    if (credentials.type === 'sqlite') {
        return credentials.uri!;
    }

    return `${credentials.host}${credentials.port === undefined ? '' : `:${credentials.port}`}`;
}

function formatms(ms: number): string {
    if (ms < 1000) {
        return `${ms}ms`;
    }

    return (ms / 1000).toFixed(2) + 's';
}
