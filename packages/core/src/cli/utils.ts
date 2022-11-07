import path from "path";
import fs from "fs-extra";
import {initConfig} from "../schema/initConfig";

export function getConfig (cwd: string) {
    console.log('获取配置文件')
    const tsConfigFile = path.join(cwd, 'picker-config.ts');
    const jsConfigFile = path.join(cwd, 'picker-config.js');
    let isTs = false;
    let configFile: string | undefined;
    if (fs.existsSync(tsConfigFile)) {
        configFile = tsConfigFile;
        isTs = true;
    } else if (fs.existsSync(jsConfigFile)) {
        configFile = jsConfigFile;
    }
    if (!configFile) {
        console.error(`没有找到配置文件`);
        console.error(`检查是否存在 "${tsConfigFile}", "${jsConfigFile}"`);
        process.exit(1);
        return;
    }

    if (isTs) {
        // we expect ts-node to be available
        const tsNode = require('ts-node');
        if (!tsNode) {
            console.error(`当前为 TypeScript 项目, 必须安装 ts-node`);
            process.exit(1);
            return;
        }
        require('ts-node').register();
    }

    const index = require(configFile);
    console.log('取到了 index')
    console.log(index)
    if (!index) {
        console.error(`无法读取 "${configFile}" 文件内容`);
        process.exit(1);
        return;
    }
    if (!index.config) {
        console.error(`这个文件中 "${configFile}" 找不到导出的 "config" 对象`);
        process.exit(1);
        return;
    }

    const config = initConfig(index.config.schemaConfig);

    return config
}

export class ExitError extends Error {
    code: number;
    constructor(code: number) {
        super(`进程 ${code} 终止。`);
        this.code = code;
    }
}
