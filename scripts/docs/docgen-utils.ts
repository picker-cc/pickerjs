import fs from 'fs';
import klawSync from 'klaw-sync';
import { basename } from 'path';
// tslint:disable:no-console

/**
 * 生成适配 11ty 的YML 文件标题和结构
 */
export function generateFrontMatter(title: string, weight: number, showToc: boolean = true): string {
    return `---
date: ${new Date().toISOString()}
title: "${title.replace(/-/g, ' ')}"
layout: content.njk
---
[comment]: <> (这个文件是从 PickerCC 源码中生，不要修改。请使用 "docs:build" 脚本命令生成。)
`;
}

export function titleCase(input: string): string {
    console.log(input)
    return input.split(' ').map(w => w[0].toLocaleUpperCase() + w.substr(1)).join(' ');
}

/**
 * 删除在outputPath中找到的所有生成的文档。
 */
export function deleteGeneratedDocs(outputPath: string) {
    if (!fs.existsSync(outputPath)) {
        return;
    }
    try {
        let deleteCount = 0;
        const files = klawSync(outputPath, {nodir: true});
        for (const file of files) {
            const content = fs.readFileSync(file.path, 'utf-8');
            if (isGenerated(content)) {
                fs.unlinkSync(file.path);
                deleteCount++;
            }
        }
        if (deleteCount) {
            console.log(`Deleted ${deleteCount} generated docs from ${outputPath}`);
        }
    } catch (e) {
        console.error('无法删除生成的文档!');
        console.log(e);
        process.exitCode = 1;
    }
}

/**
 * 如果内容与生成的文档的内容匹配，则返回true。
 */
function isGenerated(content: string) {
    return /generated\: true\n---\n/.test(content);
}
