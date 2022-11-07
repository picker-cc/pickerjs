import {SUPER_ADMIN_USER_IDENTIFIER, SUPER_ADMIN_USER_PASSWORD} from '@picker-cc/common/lib/shared-constants';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import path from 'path';
import prompts, {PromptObject} from 'prompts';

import {DbType, UserResponses} from './types';

// tslint:disable:no-console

/**
 * 提示用户确定应该如何配置新的 Picker 应用程序。
 */
export async function gatherUserResponses(root: string): Promise<UserResponses> {
    function onSubmit(prompt: PromptObject, answer: any) {
        if (prompt.name === 'dbType') {
            dbType = answer;
        }
    }

    let dbType: DbType;

    const answers = await prompts(
        [
            {
                type: 'select',
                name: 'dbType',
                message: '请选择您要使用的数据库?',
                choices: [
                    {title: 'MySQL', value: 'mysql'},
                    {title: 'MariaDB', value: 'mariadb'},
                    {title: 'Postgres', value: 'postgres'},
                    {title: 'Cockroachdb', value: 'cockroachdb'},
                    {title: 'SQLite', value: 'sqlite'},
                    {title: 'SqlServer', value: 'mssql'},
                    {title: 'Mongodb', value: 'mongodb'}
                ],
                initial: 0 as any,
            },
            {
                type: (() => (dbType === 'sqlite' ? null : 'text')) as any,
                name: 'dbHost',
                message: `数据库主机地址是什么?`,
                initial: 'localhost',
            },
            {
                type: (() => (dbType === 'sqlite' ? null : 'text')) as any,
                name: 'dbPort',
                message: `数据库监听的是哪个端口?`,
                initial: (() => defaultDBPort(dbType)) as any,
            },
            {
                type: (() => (dbType === 'sqlite' ? null : 'text')) as any,
                name: 'dbName',
                message: `数据库的名字是什么?`,
                initial: 'picker',
            },
            {
                type: (() => (dbType === 'sqlite' ? null : 'text')) as any,
                name: 'dbUserName',
                message: `数据库用户名是什么?`,
                initial: 'root',
            },
            {
                type: (() => (dbType === 'sqlite' ? null : 'password')) as any,
                name: 'dbPassword',
                message: `数据库密码是什么?`,
            },
            {
                type: 'select',
                name: 'language',
                message: '您将使用哪种编程语言?',
                choices: [
                    {title: 'TypeScript', value: 'ts'},
                    {title: 'JavaScript', value: 'js'},
                ],
                initial: 0 as any,
            },
            {
                type: 'text',
                name: 'superadminIdentifier',
                message: '您想为超级管理员用户使用什么唯一名称?',
                initial: SUPER_ADMIN_USER_IDENTIFIER,
            },
            {
                type: 'text',
                name: 'superadminPassword',
                message: '您希望超级管理员用户使用什么密码?',
                initial: SUPER_ADMIN_USER_PASSWORD,
            },
        ],
        {
            onSubmit,
            onCancel() {
                /* */
            },
        },
    );

    if (!answers.language) {
        console.log('安装中止，没有更改。');
        process.exit(0);
    }

    const {indexSource, indexWorkerSource, configSource, readmeSource, authSource, schemaSource} =
        await generateSources(root, answers);
    return {
        indexSource,
        indexWorkerSource,
        configSource,
        readmeSource,
        authSource,
        schemaSource,
        usingTs: answers.language === 'ts',
        dbType: answers.dbType,
        superadminIdentifier: answers.superadminIdentifier,
        superadminPassword: answers.superadminPassword,
    };
}

/**
 * 返回 mock "user response"，不提示，用于CI
 */
export async function gatherCiUserResponses(root: string): Promise<UserResponses> {
    const ciAnswers = {
        dbType: 'sqlite' as const,
        dbHost: '',
        dbPort: '',
        dbName: 'picker',
        dbUserName: '',
        dbPassword: '',
        language: 'ts',
        populateProducts: true,
        superadminIdentifier: SUPER_ADMIN_USER_IDENTIFIER,
        superadminPassword: SUPER_ADMIN_USER_PASSWORD,
    };
    const {indexSource, indexWorkerSource, configSource, readmeSource, authSource, schemaSource} =
        await generateSources(root, ciAnswers);
    return {
        indexSource,
        indexWorkerSource,
        configSource,
        readmeSource,
        authSource,
        schemaSource,
        usingTs: ciAnswers.language === 'ts',
        dbType: ciAnswers.dbType,
        superadminIdentifier: ciAnswers.superadminIdentifier,
        superadminPassword: ciAnswers.superadminPassword,
    };
}

/**
 * 根据 CLI 提示所指定的选项，创建索引、 worker 和 配置项。
 */
async function generateSources(
    root: string,
    answers: any,
): Promise<{
    indexSource: string;
    indexWorkerSource: string;
    configSource: string;
    readmeSource: string;
    authSource: string;
    schemaSource: string;
}> {
    const assetPath = (fileName: string) => path.join(__dirname, '../assets', fileName);

    /**
     * 帮助程序只转义单旨引号。在生成配置文件时，例如密码可能使用特殊字符（`< > ' "` 等），这些将默认转换为 HTML 实例。
     * 相反，我们禁用转义并使用这个自定义帮助工具只转义单引号字符。
     */
    Handlebars.registerHelper('escapeSingle', (aString: unknown) => {
        return typeof aString === 'string' ? aString.replace(/'/g, `\\'`) : aString;
    });

    const templateContext = {
        ...answers,
        dbType: answers.dbType,
        name: path.basename(root),
        isTs: answers.language === 'ts',
        isSQLite: answers.dbType === 'sqlite',
        requiresConnection: answers.dbType !== 'sqlite',
    };
    const configTemplate = await fs.readFile(assetPath('picker-config.hbs'), 'utf-8');
    const configSource = Handlebars.compile(configTemplate, {noEscape: true})(templateContext);
    const indexTemplate = await fs.readFile(assetPath('index.hbs'), 'utf-8');
    const indexSource = Handlebars.compile(indexTemplate)(templateContext);
    const indexWorkerTemplate = await fs.readFile(assetPath('index-worker.hbs'), 'utf-8');
    const indexWorkerSource = Handlebars.compile(indexWorkerTemplate)(templateContext);
    // const migrationTemplate = await fs.readFile(assetPath('migration.hbs'), 'utf-8');
    // const migrationSource = Handlebars.compile(migrationTemplate)(templateContext);
    const readmeTemplate = await fs.readFile(assetPath('readme.hbs'), 'utf-8');
    const readmeSource = Handlebars.compile(readmeTemplate)(templateContext);
    const authTemplate = await fs.readFile(assetPath('auth.hbs'), 'utf-8');
    const authSource = Handlebars.compile(authTemplate)(templateContext);
    const schemaTemplate = await fs.readFile(assetPath('schema.hbs'), 'utf-8');
    const schemaSource = Handlebars.compile(schemaTemplate)(templateContext);
    return {indexSource, indexWorkerSource, configSource, readmeSource, schemaSource, authSource};
}

function defaultDBPort(dbType: DbType): number {
    switch (dbType) {
        case 'mysql':
        case 'mariadb':
            return 3306;
        case 'postgres':
            return 5432;
        case 'mssql':
            return 1433;
        case 'cockroachdb':
            return 26257;
        case 'mongodb':
            return 27017
        default:
            return 3306;
    }
}
