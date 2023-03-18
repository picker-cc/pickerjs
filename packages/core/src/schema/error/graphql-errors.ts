// import { ApolloError } from '@';
import { GraphQLError } from 'graphql';
import { Source } from 'graphql/language/source';

export const userInputError = (msg: string) =>
  new GraphQLError(`内容输入错误: ${msg}`, { extensions: { code: 'PS_USER_INPUT_ERROR' } });

export const accessDeniedError = (msg: string) =>
  new GraphQLError(`没有权限: ${msg}`, { extensions: { code: 'PS_ACCESS_DENIED' } });

export const prismaError = (err: Error) => {
  if ((err as any).code === undefined) {
    return new GraphQLError(
      `Prisma error`,
      {
        extensions: { code: 'PS_PRISMA_ERROR' },
        source: new Source(JSON.stringify({ debug: { message: err.message } }))
      }
      // {
      //   debug: {
      //     message: err.message
      //   }
      // }
    );
  }
  return new GraphQLError(
    `Prisma error: ${err.message.split('\n').slice(-1)[0].trim()}`,
    {
      extensions: { code: 'PS_PRISMA_ERROR' },
      source: new Source(JSON.stringify({ prisma: { ...err } }))
    }
    // {
    //   prisma: { ...err }
    // }
  );
};

export const validationFailureError = (messages: string[]) => {
  const s = messages.map(m => `  - ${m}`).join('\n');
  // const s = messages.map(() => `  `).join('\n');
  return new GraphQLError(`数据验证错误。\n${s}`, { extensions: { code: 'PS_VALIDATION_FAILURE' } });
};

export const extensionError = (extension: string, things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new GraphQLError(`运行时发生了错误。"${extension}".\n${s}`, {
    extensions: { code: 'PS_EXTENSION_ERROR' },
    source: new Source(
      JSON.stringify({
        debug: things.map(t => ({
          stacktrace: t.error.stack,
          message: t.error.message
        }))
      })
    )
  });
  // new Source(JSON.stringify({
  //
  // })
  // }))
  // Make the original stack traces available.
  // { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
};

export const resolverError = (things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new GraphQLError(
    `解析输入字段时发生错误。\n${s}`,
    {
      extensions: { code: 'PS_RESOLVER_ERROR' },
      source: new Source(
        JSON.stringify({
          debug: things.map(t => ({
            stacktrace: t.error.stack,
            message: t.error.message
          }))
        })
      )
    }
    // Make the original stack traces available.
  );
};

export const relationshipError = (things: { error: Error; tag: string }[]) => {
  const s = things
    .map(t => `  - ${t.tag}: ${t.error.message}`)
    .sort()
    .join('\n');
  return new GraphQLError(
    `解析关系字段时发生错误。\n${s}`,
    {
      extensions: { code: 'PS_RELATIONSHIP_ERROR' },
      source: new Source(
        JSON.stringify({
          debug: things.map(t => ({
            stacktrace: t.error.stack,
            message: t.error.message
          }))
        })
      )
    }
    // Make the original stack traces available.
  );
};

export const accessReturnError = (things: { tag: string; returned: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: Returned: ${t.returned}. Expected: boolean.`).join('\n');
  return new GraphQLError(`访问控制函数返回的值无效。\n${s}`, { extensions: { code: 'PS_ACCESS_RETURN_ERROR' } });
};

// eslint-disable-next-line no-warning-comments
// FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new GraphQLError('Your request exceeded server limits', { extensions: { code: 'KS_LIMITS_EXCEEDED' } });

export const filterAccessError = ({ operation, fieldKeys }: { operation: 'filter' | 'orderBy'; fieldKeys: string[] }) =>
  new GraphQLError(`您没有权限对字段执行 ${operation} 操作 ${JSON.stringify(fieldKeys)}.`, {
    extensions: { code: 'PS_FILTER_DENIED' }
  });
