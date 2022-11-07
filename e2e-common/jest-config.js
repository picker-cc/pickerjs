const path = require('path');
const { getPackageDir } = require('./get-package-dir');

const packageArg = process.argv.find(arg => arg.startsWith('--package='));
// 我们将 CLI 参数传递给 env 变量，因为当 Jest 并发运行时，
// 这生成子进程，argv 数组的数据会丢失，但 env var 将在进程之间保持不变。
process.env.packageArg = packageArg;
const packageDirname = getPackageDir();

module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: packageDirname,
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testEnvironment: 'node',
    reporters: ['default', path.join(__dirname, 'custom-reporter.js')],
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/config/tsconfig.e2e.json',
            diagnostics: false,
            isolatedModules: true,
        },
    },
};
