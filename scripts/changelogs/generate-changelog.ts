import fs from 'fs-extra';
import path from 'path';

import { addStream } from './add-stream';
// tslint:disable-next-line:no-var-requires
const conventionalChangelogCore = require('conventional-changelog-core');

let changelogFileName = 'CHANGELOG.md';
if (process.argv.includes('--next') || process.env.npm_config_argv?.includes('publish-prerelease')) {
    changelogFileName = 'CHANGELOG_NEXT.md';
}

/**
 * 变更日志中包含的提交类型。
 */
const VALID_TYPES = ['feat', 'fix', 'perf'];

/**
 * 定义要为哪些包创建变更日志条目。
 */
const VALID_SCOPES: string[] = [
    'example'
];

const mainTemplate = fs.readFileSync(path.join(__dirname, 'template.hbs'), 'utf-8');
const commitTemplate = fs.readFileSync(path.join(__dirname, 'commit.hbs'), 'utf-8');

generateChangelogForPackage();

/**
 * 根据常规提交数据生成变更日志条目。
 */
function generateChangelogForPackage() {
    const changelogPath = path.join(__dirname, '../../', changelogFileName);
    const inStream = fs.createReadStream(changelogPath, { flags: 'a+' });
    const tempFile = path.join(__dirname, `__temp_changelog__`);
    conventionalChangelogCore(
        {
            transform: (commit: any, context: any) => {
                const includeCommit = VALID_TYPES.includes(commit.type) && scopeIsValid(commit.scope);
                if (includeCommit) {
                    return context(null, commit);
                } else {
                    return context(null, null);
                }
            },
            releaseCount: 1,
            outputUnreleased: true,
        },
        {
            version: require('../../package.json').version,
        },
        null,
        null,
        {
            mainTemplate,
            commitPartial: commitTemplate,
            finalizeContext(context: any, options: any, commits: any) {
                context.commitGroups.forEach(addHeaderToCommitGroup);
                return context;
            },
        },
    )
        .pipe(addStream(inStream))
        .pipe(fs.createWriteStream(tempFile))
        .on('finish', () => {
            fs.createReadStream(tempFile)
                .pipe(fs.createWriteStream(changelogPath))
                .on('finish', () => {
                    fs.unlinkSync(tempFile);
                });
        });
}

function scopeIsValid(scope?: string): boolean {
    for (const validScope of VALID_SCOPES) {
        if (scope && scope.includes(validScope)) {
            return true;
        }
    }
    return false;
}

/**

 * `header` 是提交类型的一个别名，让文档更可读，在HBS模板中作为副标题。
 */
function addHeaderToCommitGroup(commitGroup: any) {
    switch (commitGroup.title) {
        case 'fix':
            commitGroup.header = 'Fixes';
            break;
        case 'feat':
            commitGroup.header = 'Features';
            break;
        default:
            commitGroup.header = commitGroup.title.charAt(0).toUpperCase() + commitGroup.title.slice(1);
            break;
    }
}
