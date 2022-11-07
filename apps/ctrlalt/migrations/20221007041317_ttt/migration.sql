-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "identifier" TEXT NOT NULL DEFAULT '',
    "detail" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT NOT NULL DEFAULT '',
    "deletedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "verifyCode" TEXT NOT NULL DEFAULT '',
    "verifyCodeCreatedAt" DATETIME,
    "password" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("createdAt", "deletedAt", "enabled", "id", "identifier", "isAdmin", "lastLogin", "name", "password", "updatedAt", "verified") SELECT "createdAt", "deletedAt", "enabled", "id", "identifier", "isAdmin", "lastLogin", "name", "password", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
