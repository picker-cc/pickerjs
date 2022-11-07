import { ICache } from '../types/utils';
export declare class MapCache implements ICache {
    protected map: Map<string, any>;
    get<T>(key: string): Promise<T>;
    set<T>(key: string, value: string | T): void;
    remove(key: string): boolean;
    close(): void;
}
