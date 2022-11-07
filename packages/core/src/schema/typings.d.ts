// @prisma/migrate's types seem to not be right
declare module '@prisma/migrate' {
    export * from '@prisma/migrate/dist/migrate/src';
}
// declare namespace Express {
//     interface Request {
//         user: import("./user").User;
//     }
// }
