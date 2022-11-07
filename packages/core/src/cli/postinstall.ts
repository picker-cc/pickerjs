// postinstall 步骤有两个目的：

// 用些文件需要生成到 node_modules 中，重要的是要让它们立即可用，这样 TypeScript 之类的东西就不会失败

// 我样想要验证你的 Prisma 和 GraphQL 模式是最新的，防止新的配置中没有更新最新 schema

// 为什么在 postinstall 中进行验证而不是单独使用 validate 命令？

// 防止忘记反命令添加到 CI 中

// node_modules
//   .prisma/client (这是默认情况下 Prisma 生成 client 的地方，可以提供给用户直接使用 @prisma/client 为某些特定的需求)
//   .picker
//     - 所有 .js 都有一个对应的TypesScript .d.ts 文件.
//       我们生成普通的JavaScript是因为:
//         * 用户可能没有使用 TypeScript
//         * 我们不能/不应该依赖 node_modules 中的文件被转译，即使它们被转译了
//     - types.{js,.ts}: .d.ts 将与当前的 .picker/schema-types.ts 相同, .js 文件会是空的
//     - api.js: 列表的 API 只生成 generateNodeAPI 选项

import {createSystem} from "../createSystem";
import {
    generateCommittedArtifacts,
    generateNodeModulesArtifacts,
    validateCommittedArtifacts
} from "../schema/artifacts";
import {logColored} from "./cli-utils";
import {getConfig} from "./utils";

export async function postinstall(cwd: string, shouldFix: boolean) {

    const config = getConfig(cwd);
    const { graphQLSchema } = createSystem(config);

    if (shouldFix) {
        await generateCommittedArtifacts(graphQLSchema, config, cwd);
        logColored('\n✨ 生成 GraphQL 和 Prisma schemas\n');
    } else {
        await validateCommittedArtifacts(graphQLSchema, config, cwd);
        logColored('\n✨ GraphQL 和 Prisma schemas 是最新的\n');
    }
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);
}
