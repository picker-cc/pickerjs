# Picker Create

用于快速搭建新的 Picker 应用程序的 CLI 工具。深受 [create-react-app](https://github.com/facebook/create-react-app) 启发。

## 使用

Picker Create 需要 [Node.js](https://nodejs.org/en/) v8.9.0+ 以上版本已安装。
创建一个新项目，可以选择以下方法之一：

### npx

```sh
npx @picker-cc/create my-app
```

*[npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher.*

### npm

```sh
npm init @picker-cc my-app
```

*`npm init <initializer>` is available in npm 6+*

### Pnpm

```sh
pnpm create @picker-cc my-app
```

### Yarn

```sh
yarn create @picker-cc my-app
```

*`yarn create` is available in Yarn 0.25+*

它会在当前文件夹中创建一个名为 `my-app` 的目录

## Options

### `--use-npm`

默认情况下，如果 Pnpm 可用，Picker Create 将尝试使用它来安装所有依赖项。你可以用 `--use-npm` 标志来增开不并强制它使用 npm。

### `--log-level`

您可以使用此标志控制在安装和设置过程中生成的输出信息。有效的选项是 `slient`、`info` 和 `verbose`。默认是 `slient`。

示例:

```sh 
npx @picker-cc/create my-app --log-level verbose
```

