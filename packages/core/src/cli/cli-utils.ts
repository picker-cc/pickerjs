// tslint:disable:no-console
/**
 * 控制台内容输出颜色使用 blueish color
 */
export function logColored(message: string) {
    console.log('\x1b[36m%s\x1b[0m', message);
}
