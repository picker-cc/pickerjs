/*
This is a slightly-modified version of preconstruct's hook for use with
keystone project files in the monorepo. Importantly it doesn't accept a cwd and
sets rootMode: "upward-optional"
*/

// export const requireSource = (filePath: string) => {
//     const unregister = hook();
//     const result = require(filePath);
//     unregister();
//     return result;
// };
