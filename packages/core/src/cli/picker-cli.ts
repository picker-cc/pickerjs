#!/usr/bin/env node
import { Command } from 'commander';
// import fs from 'fs-extra';
// import path from 'path';
const program = new Command();
import { logColored } from './cli-utils';
// import { importProductsFromCsv, populateCollections, populateInitialData } from './populate';
import { postinstall } from './postinstall';
import { prisma } from './prisma';
// tslint:disable-next-line:no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../package.json').version;

// tslint:disable:no-console
logColored(`

  _____________________________ __________________
  ___  __ \\___  _/_  ____/__  //_/__  ____/__  __ \\
  __  /_/ /__  / _  /    __  ,<  __  __/  __  /_/ /
  _  ____/__/ /  / /___  _  /| | _  /___  _  _, _/
  /_/     /___/  \\____/  /_/ |_| /_____/  /_/ |_|

                                       `);
program.version(`Picker CLI v${version}`, '-v --version').name('picker');

program
  .command('postinstall')
  .description('生成客户有端 APIs 和 types')
  .option('-f, --fix', '生成确定的项目构件（prisma、graphql ...）', false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (options, command) => {
    return postinstall(process.cwd(), options.fix);
  });

program
  .command('prisma')
  .description('安全状态下运行 Prisma CLI 命令')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(command => {
    return prisma(process.cwd(), process.argv.slice(1));
  });
program.parse(process.argv);
// if (!process.argv.slice(2).length) {
//     program.help();
// }
/*
async function getApplicationRef(): Promise<INestApplication | undefined> {
    const tsConfigFile = path.join(process.cwd(), 'vendure-config.ts');
    const jsConfigFile = path.join(process.cwd(), 'vendure-config.js');
    let isTs = false;
    let configFile: string | undefined;
    if (fs.existsSync(tsConfigFile)) {
        configFile = tsConfigFile;
        isTs = true;
    } else if (fs.existsSync(jsConfigFile)) {
        configFile = jsConfigFile;
    }

    if (!configFile) {
        console.error(`Could not find a config file`);
        console.error(`Checked "${tsConfigFile}", "${jsConfigFile}"`);
        process.exit(1);
        return;
    }

    if (isTs) {
        // we expect ts-node to be available
        const tsNode = require('ts-node');
        if (!tsNode) {
            console.error(`For "populate" to work with TypeScript projects, you must have ts-node installed`);
            process.exit(1);
            return;
        }
        require('ts-node').register();
    }

    const index = require(configFile);

    if (!index) {
        console.error(`Could not read the contents of "${configFile}"`);
        process.exit(1);
        return;
    }
    if (!index.config) {
        console.error(`The file "${configFile}" does not export a "config" object`);
        process.exit(1);
        return;
    }

    const config = index.config;

    // Force the sync mode on, so that all the tables are created
    // on this initial run.
    (config.dbConnectionOptions as any).synchronize = true;

    const { bootstrap } = require('@pickerjs/core');
    console.log('Picker Server 启动引导...');
    const app = await bootstrap(config);
    return app;
}
*/
