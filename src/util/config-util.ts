import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { Level } from 'colorful-chalk-logger'
import { GlobalOptions } from '@/types'
import { logger, updateLogLevel } from './logger'
import { isNotBlankString } from './type-util'


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
 * 加载工具的配置文件，并更新全局选项；可多次调用
 *
 *  - 如果用户未指定配置文件，且配置文件不存在，则跳过；
 *  - 若用户指定了，则在配置文件不存在时抛出异常/打印错误日志
 *
 * @export
 * @param {string} projectDir
 * @param {GlobalOptions} globalOptions
 * @returns {Partial<{ generate: any, serve: any, api: any }>}
 */
export function parseApiToolConfig(
  projectDir: string,
  globalOptions: GlobalOptions,
): Partial<{ generate: any, serve: any, api: any }> {
  const configPath: string = path.resolve(projectDir, globalOptions.configPath.value)
  if (!fs.existsSync(configPath)) {
    if (globalOptions.configPath.userSpecified) {
      logger.error(`cannot find config ${ configPath }. ignored it`)
    }
    return {}
  }

  const obj: any = loadConfigDataSync(configPath, globalOptions.encoding.value)
  const checkAndCoverGlobalOption = (key: keyof GlobalOptions, t: any, checker: (t: any) => boolean) => {
    if (!globalOptions[key].userSpecified && checker(t)) {
      globalOptions[key] = { value: t, userSpecified: true }
    }
  }

  // 更新全局选项
  const rawGlobalOptions = obj.globalOptions
  checkAndCoverGlobalOption('encoding', rawGlobalOptions.encoding, isNotBlankString)

  // TODO: support other options of colorful-chalk-logger
  if (!globalOptions.logLevel.userSpecified && rawGlobalOptions.logLevel) {
    const level: Level | undefined = Level.valueOf(rawGlobalOptions.logLevel)
    if (level != null) {
      globalOptions.logLevel = {
        value: level.name,
        userSpecified: true,
      }
      updateLogLevel(level.name)
    }
  }

  const { generate, serve, api } = obj
  return { generate, serve, api }
}
