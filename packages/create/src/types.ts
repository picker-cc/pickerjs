export type DbType = 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'cockroachdb' | 'mssql' | 'mongodb';

export interface UserResponses {
    usingTs: boolean;
    dbType: DbType;
    indexSource: string;
    indexWorkerSource: string;
    configSource: string;
    // migrationSource: string;
    authSource: string;
    schemaSource: string;
    readmeSource: string;
    superadminIdentifier: string;
    superadminPassword: string;
}

export type CliLogLevel = 'silent' | 'info' | 'verbose';
