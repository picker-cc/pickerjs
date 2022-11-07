"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDistPath = exports.resolveClientPath = void 0;
const path_1 = require("path");
const resolveClientPath = (...pathSegments) => {
    console.log(__dirname);
    const clientPath = (0, path_1.resolve)(__dirname, '..', '..', 'client', ...pathSegments);
    console.log(clientPath);
    return clientPath;
};
exports.resolveClientPath = resolveClientPath;
const resolveDistPath = (...pathSegments) => (0, path_1.resolve)(__dirname, '..', '..', 'dist', ...pathSegments);
exports.resolveDistPath = resolveDistPath;
//# sourceMappingURL=resolve-path.js.map