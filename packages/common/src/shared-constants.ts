/*
 * 这个文件包含多个子模块共享的常量
 * 例如，服务器和admin-ui都需要的值。
 */
export const API_PORT = 5001;
export const ADMIN_API_PATH = 'admin-api';
export const APP_API_PATH = 'app-api';
export const DEFAULT_CHANNEL_CODE = '__default_channel__';
export const SUPER_ADMIN_ROLE_CODE = '__super_admin_role__';
export const SUPER_ADMIN_ROLE_DESCRIPTION = 'SuperAdmin';
export const SUPER_ADMIN_USER_IDENTIFIER = 'superadmin';
export const SUPER_ADMIN_USER_PASSWORD = 'superadmin';
export const CUSTOMER_ROLE_CODE = '__customer_role__';
export const CUSTOMER_ROLE_DESCRIPTION = 'Customer';
export const ROOT_COLLECTION_NAME = '__root_collection__';
export const DEFAULT_AUTH_TOKEN_HEADER_KEY = 'picker-auth-token';

// 当 @picker-cc/create 脚本运行时设置的环境变量。
// 可用于默认的行为，以适应初始创建任务
export type CREATING_PICKER_APP = 'CREATING_PICKER_APP';
export const CREATING_PICKER_APP: CREATING_PICKER_APP = 'CREATING_PICKER_APP';
