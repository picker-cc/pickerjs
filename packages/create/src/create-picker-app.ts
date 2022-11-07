/* tslint:disable:no-console */
import chalk from 'chalk';
import program from 'commander';
import detectPort from 'detect-port';
import fs from 'fs-extra';
import Listr from 'listr';
import os from 'os';
import path from 'path';
import { Observable } from 'rxjs';

import { REQUIRED_NODE_VERSION, SERVER_PORT } from './constants';
import { gatherCiUserResponses, gatherUserResponses } from './gather-user-responses';
import {
    // checkDbConnection,
    checkNodeVersion,
    checkThatNpmCanReadCwd,
    getDependencies,
    installPackages,
    isSafeToCreateProjectIn,
    isServerPortInUse,
    // shouldUseYarn,
    shouldUserPnpm,
} from './helpers';
import { CliLogLevel } from './types';

// tslint:disable-next-line:no-var-requires
const packageJson = require('../package.json');
checkNodeVersion(REQUIRED_NODE_VERSION);

let projectName: string | undefined;

// 设置环境变量，可以根据需求修改 core 或 plugins
const createEnvVar: import('@picker-cc/common/lib/shared-constants').CREATING_PICKER_APP =
    'CREATING_PICKER_APP';
process.env[createEnvVar] = 'true';

program
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
        projectName = name;
    })
    .option(
        '--log-level <logLevel>',
        `Log level, either 'silent', 'info', or 'verbose'`,
        /^(silent|info|verbose)$/i,
        'silent',
    )
    .option('--use-npm', '使用 npm 而不是 Pnpm 作为默认包管理器')
    .option('--ci', '在没有提示的情况下运行，以便在 CI 场景中使用')
    .parse(process.argv);

const options = program.opts();
createApp(projectName, options.useNpm, options.logLevel || 'silent', options.ci);

async function createApp(
    name: string | undefined,
    useNpm: boolean,
    logLevel: CliLogLevel,
    isCi: boolean = false,
) {
    if (!runPreChecks(name, useNpm)) {
        return;
    }
    if (await isServerPortInUse()) {
        console.log(chalk.red(`端口 ${SERVER_PORT} 被占用。请释放端口然后重试。`));
        process.exit(1);
    }

    console.log(`欢迎使用 @picker-cc/create v${packageJson.version}!`);
    console.log();
    console.log(`让我们开始配置一个新的 Picker 项目:`);
    console.log();

    const root = path.resolve(name);
    const appName = path.basename(root);
    const {
        dbType,
        usingTs,
        configSource,
        indexSource,
        indexWorkerSource,
        readmeSource,
        authSource,
        schemaSource,
    } = isCi ? await gatherCiUserResponses(root) : await gatherUserResponses(root);

    // const useYarn = useNpm ? false : shouldUseYarn();
    const usePnpm = useNpm ? false : shouldUserPnpm();

    const originalDirectory = process.cwd();
    process.chdir(root);
    if (!usePnpm && !checkThatNpmCanReadCwd()) {
        process.exit(1);
    }

    const packageJsonContents = {
        name: appName,
        version: '0.1.0',
        private: true,
        scripts: {
            'run:server': usingTs ? 'ts-node ./src/index.ts' : 'node ./src/index.js',
            // 'run:worker': usingTs ? 'ts-node ./src/index-worker.ts' : 'node ./src/index-worker.js',
            start: usePnpm ? 'concurrently pnpm:run:*' : 'concurrently npm:run:*',
            ...(usingTs ? { build: 'tsc' } : undefined),
        },
    };

    console.log();
    console.log(`设置您的新 Picker 项目 ${chalk.green(root)}`);
    console.log('这可能需要几分钟 ...');
    console.log();

    const tasks = new Listr([
        {
            title: '安装依赖关系',
            task: (() => {
                return new Observable(subscriber => {
                    subscriber.next('创建 package.json');
                    fs.writeFileSync(
                        path.join(root, 'package.json'),
                        JSON.stringify(packageJsonContents, null, 2) + os.EOL,
                    );
                    const { dependencies, devDependencies } = getDependencies(
                        usingTs,
                        dbType,
                        isCi ? `@${packageJson.version}` : '',
                    );

                    subscriber.next(`安装中 ${dependencies.join(', ')}`);
                    installPackages(root, usePnpm, dependencies, false, logLevel, isCi)
                        .then(() => {
                            if (devDependencies.length) {
                                subscriber.next(`安装中 ${devDependencies.join(', ')}`);
                                return installPackages(root, usePnpm, devDependencies, true, logLevel, isCi);
                            }
                        })
                        .then(() => subscriber.complete())
                        .catch(err => subscriber.error(err));
                });
            }) as any,
        },
        {
            title: '生成应用脚手架',
            task: ctx => {
                return new Observable(subscriber => {
                    fs.ensureDirSync(path.join(root, 'src'));
                    const assetPath = (fileName: string) => path.join(__dirname, '../assets', fileName);
                    const srcPathScript = (fileName: string): string =>
                        path.join(root, 'src', `${fileName}.${usingTs ? 'ts' : 'js'}`);
                    const rootPathScript = (fileName: string): string =>
                        path.join(root, `${fileName}.${usingTs ? 'ts' : 'js'}`);
                    ctx.configFile = srcPathScript('picker-config');

                    fs.writeFile(ctx.configFile, configSource)
                        .then(() => fs.writeFile(srcPathScript('index'), indexSource))
                        .then(() => fs.writeFile(srcPathScript('index-worker'), indexWorkerSource))
                        // .then(() => fs.writeFile(rootPathScript('migration'), migrationSource))
                        .then(() => fs.writeFile(srcPathScript('schema'), schemaSource))
                        .then(() => fs.writeFile(srcPathScript('auth'), authSource))
                        .then(() => fs.writeFile(path.join(root, 'README.md'), readmeSource))
                        .then(() =>
                            fs.copyFile(assetPath('gitignore.template'), path.join(root, '.gitignore')),
                        )
                        .then(() => {
                            subscriber.next(`创建文件`);
                            if (usingTs) {
                                return fs.copyFile(
                                    assetPath('tsconfig.template.json'),
                                    path.join(root, 'tsconfig.json'),
                                );
                            }
                        })
                        .then(() => createDirectoryStructure(root))
                        .then(() => {
                            subscriber.complete()
                        })
                        // .then(() => {
                        //     subscriber.next(`创建目录结构`);
                        //     return copyEmailTemplates(root);
                        // })
                        // .then(() => {
                        //     subscriber.next(`复制 email templates`);
                        //     subscriber.complete();
                        // })
                        .catch(err => subscriber.error(err));
                });
            },
        },
        {
            title: '初始化服务器',
            task: async ctx => {
                try {
                    if (usingTs) {
                        // register ts-node so that the config file can be loaded
                        require(path.join(root, 'node_modules/ts-node')).register();
                    }
                    const { bootstrap, DefaultLogger, LogLevel } = await import(
                        path.join(root, 'node_modules/@picker-cc/core/dist/index')
                    );
                    const { config } = await import(ctx.configFile);
                    // const assetsDir = path.join(__dirname, '../assets');

                    // const initialDataPath = path.join(assetsDir, 'initial-data.json');
                    const port = await detectPort(3000);
                    const pickerLogLevel =
                        logLevel === 'silent'
                            ? LogLevel.Error
                            : logLevel === 'verbose'
                            ? LogLevel.Verbose
                            : LogLevel.Info;

                    // const bootstrapFn = async () => {
                    //     await checkDbConnection(config.dbConnectionOptions, root);
                    //     const _app = await bootstrap({
                    //         ...config,
                    //         apiOptions: {
                    //             ...(config.apiOptions ?? {}),
                    //             port,
                    //         },
                    //         silent: logLevel === 'silent',
                    //         dbConnectionOptions: {
                    //             ...config.dbConnectionOptions,
                    //             synchronize: true,
                    //         },
                    //         logger: new DefaultLogger({ level: pickerLogLevel }),
                    //         importExportOptions: {
                    //             importAssetsDir: path.join(assetsDir, 'images'),
                    //         },
                    //     });
                    //     await _app.get(JobQueueService).start();
                    //     return _app;
                    // };

                    // const app = await populate(
                    //     bootstrapFn,
                    //     initialDataPath,
                    //     populateProducts ? path.join(assetsDir, 'products.csv') : undefined,
                    // );
                    // const app = await bootstrapFn();
                    const app = await bootstrap({
                        ...config,
                        apiOptions: {
                            ...(config.apiOptions ?? {}),
                            port,
                        },
                        // slient: logLevel === 'slient',
                        logger: new DefaultLogger({ level: pickerLogLevel })
                    })
                    if (!app) {
                        throw new Error('无法启动 Picker 应用程序');
                    }
                    // Logger.info('Done!', loggerCtx);

                    // 暂停以确保 worker 队列有时间完成
                    if (isCi) {
                        console.log('[CI] 暂停之前关闭...');
                    }
                    await new Promise(resolve => setTimeout(resolve, isCi ? 30000 : 2000));
                    await app.close();
                    if (isCi) {
                        console.log('[CI] 暂停之后关闭...');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            },
        },
    ]);

    try {
        await tasks.run();
    } catch (e) {
        console.error(chalk.red(JSON.stringify(e)));
        process.exit(1);
    }
    const startCommand = usePnpm ? 'pnpm start' : 'npm run start';
    console.log();
    console.log(chalk.green(`成功! 在 ${root} 创建了一个新的 Picker 服务。`));
    console.log();
    console.log(`我们建议您用下面的方式开始:`);
    console.log();
    console.log(chalk.green(`    cd ${name}`));
    console.log(chalk.green(`    ${startCommand}`));
    console.log();
    console.log('Happy day!');
    process.exit(0);
}

/**
 * 运行一些初始检查，以确保可以在给定位置继续创建新的 Picker 项目。
 */
function runPreChecks(name: string | undefined, useNpm: boolean): name is string {
    if (typeof name === 'undefined') {
        console.error('请指定项目目录:');
        console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
        console.log();
        console.log('示例:');
        console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-picker-app')}`);
        process.exit(1);
        return false;
    }

    const root = path.resolve(name);
    fs.ensureDirSync(name);
    if (!isSafeToCreateProjectIn(root, name)) {
        process.exit(1);
    }
    return true;
}

/**
 * 为一个新的 Picker 项目生成默认目录结构
 */
async function createDirectoryStructure(root: string) {
    // await fs.ensureDir(path.join(root, 'static', 'email', 'test-emails'));
    await fs.ensureDir(path.join(root, 'static', 'assets'));
}

/**
 * Copy the email templates into the app
 */
async function copyEmailTemplates(root: string) {
    const templateDir = path.join(root, 'node_modules/@picker/email-plugin/templates');
    try {
        await fs.copy(templateDir, path.join(root, 'static', 'email', 'templates'));
    } catch (err) {
        console.error(chalk.red(`Failed to copy email templates.`));
    }
}
