import path from 'path';
// import { ConnectionOptions } from 'typeorm';
import { promisify } from 'util';

import { TestDbInitializer } from './test-db-initializer';
// import {MongoConnection} from "@mikro-orm/mongodb";
import {Options} from "@mikro-orm/core";

export class MongoInitializer implements TestDbInitializer<Options> {
    private client: import('mongodb').MongoClient;

    async init(
        testFileName: string,
        connectionOptions: Options,
    ): Promise<Options> {
        const dbName = this.getDbNameFromFilename(testFileName);
        this.client = await this.getMongoConnection(connectionOptions);
        connectionOptions.dbName = dbName
        // console.log(connectionOptions)
        // (connectionOptions as any).database = dbName;
        // (connectionOptions as any).synchronize = true;
        // const query = promisify(this.conn.query).bind(this.conn);
        // await query(`DROP DATABASE IF EXISTS ${dbName}`);
        // await query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        return connectionOptions;
    }

    async populate(populateFn: () => Promise<void>): Promise<void> {
        await populateFn();
    }

    async destroy() {
        await promisify(this.client.close).bind(this.client)();
    }

    private async getMongoConnection(
        connectionOptions: Options,
    ): Promise<import('mongodb').MongoClient> {

        const { MongoClient } = require('mongodb');
        const client = new MongoClient(connectionOptions.clientUrl)
        await client.connect()
        await client.db(connectionOptions.dbName)
        // console.log('Connected successfully to server')
        // const conn = createConnection({
        //     host: connectionOptions.host,
        //     port: connectionOptions.port,
        //     user: connectionOptions.username,
        //     password: connectionOptions.password,
        // });
        // const client = new MongoClient(connectionOptions.clientUrl)
        // client.connect().then()
        // client.db(connectionOptions.dbName)
        return client
    }

    private getDbNameFromFilename(filename: string): string {
        return 'e2e_' + path.basename(filename).replace(/[^a-z0-9_]/gi, '_');
    }
}
