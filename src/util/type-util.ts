/**
 * check whether is a function.
 * @param x
 */
export function isFunction(x: any): x is Function {
  return Object.prototype.toString.call(x) === '[object Function]'
}


/**
 * check whether is a number.
 * @param x
 */
export function isNumber(x: any): x is number {
  return Object.prototype.toString.call(x) === '[object Number]'
}


/**
 * check whether is a string.
 * @param x
 */
export function isString(x: any): x is string {
  return Object.prototype.toString.call(x) === '[object String]'
}


/**
 * check whether is a blank string.
 * @param x
 */
export function isNotBlankString(x: any): boolean {
  return isString(x) && x.length > 0
}


/**
 * check whether is a number or a string which can parsed to a number.
 * @param x
 */
export function isNumberLike(x: any): x is (number | string) {
  if (typeof x === 'number') return true
  return isString(x) && !Number.isNaN(Number(x))
}


/**
 * check whether is an array
 * @param x
 */
export function isArray(x: any): x is any[] {
  return Array.isArray(x)
}


/**
 * check whether is an empty array
 * @param x
 */
export function isNotBlankArray(x: any): boolean {
  return isArray(x) && x.length > 0
}


/**
 * convert a string to a number, requires the string is complete consists with number (or decimal point).
 * @param x
 */
export function convertToNumber(x: string): number {
  return Number(x)
}
