

/**
 * 转为中划线加连字符格式的字符串
 * @param s
 */
export function convertToKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .replace(/_/g, '$1-$2')
    .toLowerCase()
}


/**
 * 转为驼峰式的字符串
 * @param s
 * @param capitalize    首字母是否大写
 */
export function convertToCamel(s: string, capitalize = false): string {
  s = s.replace(/[-_](\w)/g, (m, c) => c.toUpperCase())
  if (capitalize) return s.charAt(0).toUpperCase() + s.slice(1)
  return s
}
