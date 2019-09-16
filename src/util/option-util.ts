import { isNumberLike, isString, convertToNumber, isFunction, isNotBlankString } from './type-util'


/**
 * 覆盖选项
 * @member valueSet     可取的值的枚举列表
 * @member verifyValue  校验给定的值是否合法
 * @member convertValue 将传进来的值转为特定的值后返回
 */
interface CoverOptions<T> {
  valueSet?: T[]
  verifyValue?: (v: any) => boolean
  convertValue?: (v: any) => T
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined，则返回默认值
 * 否则根据 options 进行相应的校验、转换处理
 *
 * @param defaultValue  默认值，若为函数，则表示由函数的返回值作为默认值；
 *                      若想传递函数，可以再封装一层函数
 * @param value         传进来的选项值
 * @param options       覆盖选项
 */
export function cover<T, T2 = T>(
  defaultValue: T | (() => T),
  value?: T2,
  options?: CoverOptions<T>,
): T {
  const getDefaultValue = isFunction(defaultValue) ? defaultValue : () => defaultValue
  if (value == null) return getDefaultValue()
  if (options == null) return value as unknown as T
  if (options.valueSet != null && !options.valueSet.includes(value as any)) return getDefaultValue()
  if (options.verifyValue != null && !options.verifyValue(value)) return getDefaultValue()
  if (options.convertValue != null) return options.convertValue(value)
  return value as unknown as T
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或非数字，则返回默认值；
 * 否则将传进来的值转为 number 并返回
 *
 * @param defaultValue  默认值
 * @param value         传进来的值
 */
export function coverNumber(defaultValue: number, value?: any): number {
  return cover<number>(defaultValue, value, {
    verifyValue: isNumberLike,
    convertValue: convertToNumber,
  })
}


/**
 * 传进来的选项覆盖默认值
 * 若传进来的值为 null/undefined 或空字符串，则返回默认值
 *
 * @param defaultValue  默认值
 * @param value         传进来的值
 */
export function coverString(defaultValue: string, value?: any): string {
  return cover<string>(defaultValue, value, {
    verifyValue: isString,
  })
}


/**
 * 若 value 为字符串，则除 'false' 外的非空字符串均为 true
 * 否则，以 Boolean(value) 处理
 *
 * @param defaultValue  默认值
 * @param value         传进来的值
 */
export function coverBoolean(defaultValue: boolean, value?: any): boolean {
  if (value == null) return defaultValue
  if (typeof value === 'string') return isNotBlankString(value) && value !== 'false'
  return Boolean(value)
}


/**
 * 优先 optionValue，其次 configValue，其次 defaultValue
 *
 * @export
 * @param {string} defaultValue
 * @param {*} [configValue]
 * @param {*} [cliValue]
 * @returns {string}
 */
export function coverStringForCliOption(
  defaultValue: string,
  configValue?:any,
  cliValue?: any,
): string {
  const value = coverString(configValue, cliValue)
  return coverString(defaultValue, value)
}


/**
 * 优先 optionValue，其次 configValue，其次 defaultValue
 *
 * @export
 * @param {number} defaultValue
 * @param {*} [configValue]
 * @param {*} [cliValue]
 * @param {{
 *     minValue?: number,
 *     maxValue?: number,
 *   }} [limits]
 * @returns {number}
 */
export function coverNumberForCliOption(
  defaultValue: number,
  configValue?: any,
  cliValue?: any,
  limits?: {
    minValue?: number,
    maxValue?: number,
  }
): number {
  let value = coverNumber(configValue, cliValue)
  value = coverNumber(defaultValue, value)
  if (limits == null) return value
  if (limits.minValue != null) value = Math.max(limits.minValue, value)
  if (limits.maxValue != null) value = Math.min(limits.maxValue, value)
  return value
}



/**
 * 优先 optionValue，其次 configValue，其次 defaultValue
 *
 * @export
 * @param {boolean} defaultValue
 * @param {*} [configValue]
 * @param {*} [cliValue]
 * @returns {boolean}
 */
export function coverBooleanForCliOption(
  defaultValue: boolean,
  configValue?: any,
  cliValue?: any
): boolean {
  const value = coverBoolean(configValue, cliValue)
  return coverBoolean(defaultValue, value)
}
