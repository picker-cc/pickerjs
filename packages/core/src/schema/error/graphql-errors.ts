import { ApolloError } from 'apollo-server-errors';

export const userInputError = (msg: string) => new ApolloError(`内容输入错误: ${msg}`, 'PS_USER_INPUT_ERROR');

export const accessDeniedError = (msg: string) => new ApolloError(`没有权限: ${msg}`, 'PS_ACCESS_DENIED');

export const prismaError = (err: Error) => {
  if ((err as any).code === undefined) {
    return new ApolloError(`Prisma error`, 'PS_PRISMA_ERROR', {
      debug: {
        message: err.message
      }
    });
  }
  return new ApolloError(`Prisma error: ${err.message.split('\n').slice(-1)[0].trim()}`, 'PS_PRISMA_ERROR', {
    prisma: { ...err }
  });
};

export const validationFailureError = (messages: string[]) => {
  // const s = messages.map(m => `  - ${m}`).join('\n');
  const s = messages.map(() => `  `).join('\n');
  return new ApolloError(`数据验证错误。\n${s}`, 'PS_VALIDATION_FAILURE');
};

export const extensionError = (extension: string, things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `运行时发生了错误。"${extension}".\n${s}`,
    'PS_EXTENSION_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const resolverError = (things: { error: Error; tag: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new ApolloError(
    `解析输入字段时发生错误。\n${s}`,
    'PS_RESOLVER_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const relationshipError = (things: { error: Error; tag: string }[]) => {
  const s = things
    .map(t => `  - ${t.tag}: ${t.error.message}`)
    .sort()
    .join('\n');
  return new ApolloError(
    `解析关系字段时发生错误。\n${s}`,
    'PS_RELATIONSHIP_ERROR',
    // Make the original stack traces available.
    { debug: things.map(t => ({ stacktrace: t.error.stack, message: t.error.message })) }
  );
};

export const accessReturnError = (things: { tag: string; returned: string }[]) => {
  const s = things.map(t => `  - ${t.tag}: Returned: ${t.returned}. Expected: boolean.`).join('\n');
  return new ApolloError(`访问控制函数返回的值无效。\n${s}`, 'PS_ACCESS_RETURN_ERROR');
};

// FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const limitsExceededError = (args: { type: string; limit: number; list: string }) =>
  new ApolloError('Your request exceeded server limits', 'KS_LIMITS_EXCEEDED');

export const filterAccessError = ({ operation, fieldKeys }: { operation: 'filter' | 'orderBy'; fieldKeys: string[] }) =>
  new ApolloError(`您没有权限对字段执行 ${operation} 操作 ${JSON.stringify(fieldKeys)}.`, 'PS_FILTER_DENIED');
