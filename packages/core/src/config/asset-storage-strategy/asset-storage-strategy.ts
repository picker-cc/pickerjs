import { Stream } from 'stream';
import { Request } from 'express';

/**
 * @description
 * The AssetPersistenceStrategy determines how Asset files are physically stored
 * and retrieved.
 *
 * @docsCategory assets
 */
export interface AssetStorageStrategy {
  /**
   * Writes a buffer to the store and returns a unique identifier for that
   * file such as a file path or a URL.
   */
  writeFileFromBuffer(fileName: string, data: Buffer): Promise<string>;

  /**
   * Writes a readable stream to the store and returns a unique identifier for that
   * file such as a file path or a URL.
   */
  writeFileFromStream(fileName: string, data: Stream): Promise<string>;

  /**
   * Reads a file based on an identifier which was generated by the writeFile
   * method, and returns the file in binary form.
   */
  readFileToBuffer(identifier: string): Promise<Buffer>;

  /**
   * Reads a file based on an identifier which was generated by the writeFile
   * method, and returns the file in binary form.
   */
  readFileToStream(identifier: string): Promise<Stream>;

  /**
   * Check whether a file with the given name already exists. Used to avoid
   * naming conflicts before saving the file.
   */
  fileExists(fileName: string): Promise<boolean>;

  /**
   * Convert an identifier as generated by the writeFile... methods into an absolute
   * url (if it is not already in that form). If no conversion step is needed
   * (i.e. the identifier is already an absolute url) then this method
   * should not be implemented.
   */
  toAbsoluteUrl?(reqest: Request, identifier: string): string;
}
