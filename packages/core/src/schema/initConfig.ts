import { applyIdFieldDefaults } from './applyIdFieldDefaults';
import { SchemaConfig } from './types';

/*
  该函数执行验证和其他初始化逻辑，在使用之前需要 Schema Config 上运行
*/

export function initConfig(config: SchemaConfig) {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new Error('无效的 db 配置。请指定 db.provider 为 "sqlite"，"postgresql" 或 "mysql"');
  }

  return { ...config, lists: applyIdFieldDefaults(config) };
}
