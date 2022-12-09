/**
 * 将字符串的第一个字符转换为大写。
 * @param {String} str 要转换的字符串
 * @returns 新字符串
 */
export const upcase = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1);

/**
 * 将传入的字段串转换为可读的内容
 * @param {String} str 要转换的字符串.
 * @returns 新字符串
 */
export const humanize = (str: string) => {
  return str
    .replace(/([a-z])([A-Z]+)/g, '$1 $2')
    .split(/\s|_|\-/)
    .filter(i => i)
    .map(upcase)
    .join(' ');
};
