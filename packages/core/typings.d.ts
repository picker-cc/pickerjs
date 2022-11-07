// This file is for any 3rd party JS libs which don't have a corresponding @types/ package.

declare module 'opn' {
    declare const opn: (path: string) => Promise<any>;
    export default opn;
}

declare module 'i18next-icu' {
    // default
}

declare module 'i18next-fs-backend' {
    // default
}

// @prisma/migrate's types seem to not be right
declare module '@prisma/migrate' {
    export * from '@prisma/migrate/dist/migrate/src';
}
