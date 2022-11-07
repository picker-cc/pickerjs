import {createSystem} from "../createSystem";
import {generateNodeModulesArtifacts, validateCommittedArtifacts} from "../schema/artifacts";
import {ExitError, getConfig} from "./utils";

export async function prisma(cwd: string, args: string[]) {
    const config = getConfig(cwd);

    const {graphQLSchema} = createSystem(config);

    await validateCommittedArtifacts(graphQLSchema, config, cwd);
    await generateNodeModulesArtifacts(graphQLSchema, config, cwd);

    // @ts-ignore
    const {execa} = await import('execa')
    const result = await execa('node',
        [require.resolve('prisma'), ...args],
        {
            cwd,
            stdio: 'inherit',
            reject: false,
            env: {
                ...process.env,
                DATABASE_URL: config.db.url,
                PRISMA_HIDE_UPDATE_MESSAGE: '1',
            },
        });
    if (result.exitCode !== 0) {
        throw new ExitError(result.exitCode);
    }
}
