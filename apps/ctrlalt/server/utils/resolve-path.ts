import { resolve } from 'path';

/**
 * resolve client file path
 * @param pathSegments relative path of file in client
 * @returns absolute path of file
 */
export const resolveClientPath = (...pathSegments: string[]) => {
    console.log(__dirname)
    const clientPath = resolve(__dirname, '..', '..', 'client', ...pathSegments);
    console.log(clientPath)
    return clientPath
}

/**
 * resolve dist file path
 * @param pathSegments relative path of file in dist
 * @returns absolute path of file
 */
export const resolveDistPath = (...pathSegments: string[]) =>
  resolve(__dirname, '..', '..', 'dist', ...pathSegments);
