import fs from 'fs-extra'
import yaml from 'js-yaml'
import { logger } from './logger'


/**
 * 加载配置文件内容，并将其转为对象
 *
 * @export
 * @param {string} configPath
 * @param {string} encoding
 * @returns {(any | never)}
 */
export function loadConfigDataSync(configPath: string, encoding: string): any | never {
  const rawContent: string = fs.readFileSync(configPath, encoding)

  // json format
  if (/\.json$/.test(configPath)) return JSON.parse(rawContent)

  // yaml format
  if (/\.(yml|yaml)$/.test(configPath)) return yaml.safeLoad(rawContent)

  // unsupported config file
  throw new Error(`${ configPath } must be a file which the extension is .json/.yml/.yaml`)
}


/**
 * 通过 json 格式的文件构造 ApiToolGeneratorContextParams
 *
 * @export
 * @template T
 * @param {string} mainConfigPath
 * @param {('generate' | 'serve' | 'api' | 'globalOptions')} key
 * @returns {Partial<T>}
 */
export function parseApiToolConfig<T>(mainConfigPath: string, key: 'generate' | 'serve' | 'api' | 'globalOptions'): Partial<T> {
  if (!fs.existsSync(mainConfigPath)) {
    logger.error(`cannot find config ${ mainConfigPath }. ignored it`)
    return {}
  }
  const obj: any = loadConfigDataSync(mainConfigPath, 'utf-8')
  return obj[key] as Partial<T> || {}
}
