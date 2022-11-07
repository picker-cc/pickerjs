import path from 'path';

export function getConfigPath(cwd: string) {
  return path.join(cwd, 'picker-config');
}

// export function getAdminPath(cwd: string) {
//   return path.join(cwd, '.picker/admin');
// }

export class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`进程 ${code} 终止。`);
    this.code = code;
  }
}
