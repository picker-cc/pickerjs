/* tslint:disable:no-console */
import fs from 'fs-extra';
import klawSync from 'klaw-sync';
import path, { extname } from 'path';

import { deleteGeneratedDocs } from './docgen-utils';
import { TypeMap } from './typescript-docgen-types';
import { TypescriptDocsParser } from './typescript-docs-parser';
import { TypescriptDocsRenderer } from './typescript-docs-renderer';

interface DocsSectionConfig {
    sourceDirs: string[];
    exclude?: RegExp[];
    outputPath: string;
}

const sections: DocsSectionConfig[] = [
    {
        sourceDirs: [
            'packages/core/src/',
            'packages/common/src/',
            // 'packages/asset-server-plugin/src/',
            // 'packages/elasticsearch-plugin/src/',
        ],
        outputPath: 'typescript-api',
    },
];

generateTypescriptDocs(sections);

const watchMode = !!process.argv.find(arg => arg === '--watch' || arg === '-w');
if (watchMode) {
    console.log(`监测对源文件的更改...`);
    sections.forEach(section => {
        section.sourceDirs.forEach(dir => {
            fs.watch(dir, { recursive: true }, (eventType, file) => {
                if (extname(file) === '.ts') {
                    console.log(`检测变化 ${dir}`);
                    generateTypescriptDocs([section], true);
                }
            });
        });
    });
}

/**
 * 使用 TypeScript 编译器 API 解析给定的文件，并将文档提取到 markdown 文件中
 */
function generateTypescriptDocs(config: DocsSectionConfig[], isWatchMode: boolean = false) {
    const timeStart = +new Date();

    // 该映射用于缓存类型及期对应的 11ty 路径。
    // 它用于启用一个成员的 "type" 超链接到该类型的地定义。
    const globalTypeMap: TypeMap = new Map();

    if (!isWatchMode) {
        for (const { outputPath, sourceDirs } of config) {
            deleteGeneratedDocs(absOutputPath(outputPath));
        }
    }

    for (const { outputPath, sourceDirs, exclude } of config) {
        const sourceFilePaths = getSourceFilePaths(sourceDirs, exclude);
        const docsPages = new TypescriptDocsParser().parse(sourceFilePaths);
        for (const page of docsPages) {
            const { category, fileName, declarations } = page;
            for (const declaration of declarations) {
                const pathToTypeDoc = `${outputPath}/${category ? category + '/' : ''}${
                    fileName === '_index' ? '' : fileName
                }#${toHash(declaration.title)}`;
                globalTypeMap.set(declaration.title, pathToTypeDoc);
            }
        }
        const docsUrl = `/docs`;
        const generatedCount = new TypescriptDocsRenderer().render(
            docsPages,
            docsUrl,
            absOutputPath(outputPath),
            globalTypeMap,
        );

        if (generatedCount) {
            console.log(
                `Generated ${generatedCount} typescript api docs for "${outputPath}" in ${
                    +new Date() - timeStart
                }ms`,
            );
        }
    }
}

function toHash(title: string): string {
    return title.replace(/\s/g, '').toLowerCase();
}

function absOutputPath(outputPath: string): string {
    return path.join(__dirname, '../../docs/content/', outputPath);
}

function getSourceFilePaths(sourceDirs: string[], excludePatterns: RegExp[] = []): string[] {
    return sourceDirs
        .map(scanPath =>
            klawSync(path.join(__dirname, '../../', scanPath), {
                nodir: true,
                filter: item => {
                    if (path.extname(item.path) === '.ts') {
                        for (const pattern of excludePatterns) {
                            if (pattern.test(item.path)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                },
                traverseAll: true,
            }),
        )
        .reduce((allFiles, files) => [...allFiles, ...files], [])
        .map(item => item.path);
}
