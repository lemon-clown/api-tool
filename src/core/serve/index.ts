import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { parseApiToolConfig } from '@/util/config-util'
import { coverStringForCliOption, coverNumberForCliOption, coverBooleanForCliOption } from '@/util/option-util'
import { ApiToolServeContext, ApiToolServeContextParams } from './context'
import { ApiToolMockServer } from './server'
export { ApiToolServeContext } from './context'
export { ApiToolMockServer } from './server'


/**
 * serve 命令的参数选项
 *
 * @member tsconfigPath         tsconfig.json 所在的路径
 * @member schemaRootPath       生成的 Json-Schema 存放的文件夹
 * @member apiItemConfigPath    定义 ApiItems 的文件路径（yaml 格式）
 * @member configPath           json 格式的配置文件，通过此文件构造 ApiToolGeneratorContextParams（低优先级）；
 *                              此配置文件内容与 ApiToolGeneratorContextParams 类型保持一直，用来指定改变 generator 行为的参数
 * @member requiredOnly         是否只返回 JSON-SCHEMA 中 required 的属性
 * @member alwaysFakeOptionals  是否始终都返回所有的非 required 的属性
 * @member optionalsProbability 非 required 的属性出现在 mock 数据中的几率
 */
export interface ServerOptions {
  host: string
  port: number
  schemaRootPath: string
  apiItemConfigPath: string
  prefixUrl: string
  configPath: string
  requiredOnly: boolean
  alwaysFakeOptionals: boolean
  useDataFileFirst: boolean
  dataFileRootPath?: string
  optionalsProbability?: number
}


/**
 * 加载 serve 命令
 * @param program         commander 实例
 * @param globalOptions   全局选项
 */
export function loadServeCommand (program: commander.Command, globalOptions: GlobalOptions) {
  program
    .command('serve <project-dir>')
    .alias('s')
    .option('-h, --host <host>', 'specify the ip/domain address to which the mock-server listens. (default: localhost)')
    .option('-p, --port <port>', 'specify the port on which the mock-server listens. (default: 8080)')
    .option('-s, --schema-root-path <schemaRootPath>', 'specify the root directory (absolute or relative to the projectDir) to save schemas. (default: data/schemas)')
    .option('-i, --api-item-config-path <apiItemConfigPath>', 'specify the location (absolute or relative to the projectDir) of file contains apiItems. (default: api.yml)')
    .option('--prefix-url <prefixUrl>', 'specify the prefix url of routes. (default: \'\')')
    .option('--use-data-file-first', 'preferred use data file as mock data source. (default: false)')
    .option('--data-file-root-path <dataFileRootPath>', 'specify the data file (used as data source) root path. (default: undefined)')
    .option('--required-only', 'json-schema-faker\'s option: if enabled, only required properties will be generated. (default: false)')
    .option('--always-fake-optionals', 'json-schema-faker\'s option: when enabled, it will set optionalsProbability: 1.0 and fixedProbabilities: true. (default: false)')
    .option('--optionals-probability <optionalsProbability>', 'json-schema-faker\'s option: a value from 0.0 to 1.0 to generate values in a consistent way. (default: .8)')
    .action(async function (projectDir: string, options: ServerOptions) {
      const cwd = globalOptions.cwd.value
      logger.debug('[serve] cwd:', cwd)
      logger.debug('[serve] rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const contextParams: Partial<ApiToolServeContextParams> = parseApiToolConfig(projectDir, globalOptions).serve || {}
      logger.debug('[serve] contextParams:', contextParams)

      // 计算路径
      const resolvePath = (key: keyof Pick<ApiToolServeContextParams, 'schemaRootPath' | 'apiItemConfigPath'>, defaultValue: string): string => {
        const value = coverStringForCliOption(defaultValue, contextParams[key], options[key])
        return path.resolve(projectDir, value)
      }

      const host: string = coverStringForCliOption('localhost', contextParams.host, options.host)
      const port: number = coverNumberForCliOption(8080, contextParams.port, options.port, { minValue: 1, maxValue: 65536 })
      const prefixUrl: string = coverStringForCliOption('', contextParams.prefixUrl, options.prefixUrl)
      const encoding = globalOptions.encoding.value
      const schemaRootPath = resolvePath('schemaRootPath', 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', 'api.yml')
      const mainConfigPath = globalOptions.configPath.value
      const useDataFileFirst = coverBooleanForCliOption(false, contextParams.useDataFileFirst, options.useDataFileFirst)
      const dataFileRootPath = coverStringForCliOption(undefined as any, contextParams.dataFileRootPath, options.dataFileRootPath)
      const requiredOnly = coverBooleanForCliOption(false, contextParams.requiredOnly, options.requiredOnly)
      const alwaysFakeOptionals = coverBooleanForCliOption(false, contextParams.alwaysFakeOptionals, options.alwaysFakeOptionals)
      const optionalsProbability: number = coverNumberForCliOption(.8, contextParams.optionalsProbability, options.optionalsProbability)

      logger.debug('[serve] encoding:', encoding)
      logger.debug('[serve] projectDir:', projectDir)
      logger.debug('[serve] host:', host)
      logger.debug('[serve] port:', port)
      logger.debug('[serve] prefixUrl:', prefixUrl)
      logger.debug('[serve] schemaRootPath:', schemaRootPath)
      logger.debug('[serve] apiItemConfigPath:', apiItemConfigPath)
      logger.debug('[serve] mainConfigPath:', mainConfigPath)
      logger.debug('[serve] useDataFileFirst:', useDataFileFirst)
      logger.debug('[serve] dataFileRootPath:', dataFileRootPath)
      logger.debug('[serve] requiredOnly:', requiredOnly)
      logger.debug('[serve] alwaysFakeOptionals:', alwaysFakeOptionals)
      logger.debug('[serve] optionalsProbability:', optionalsProbability)

      const context = new ApiToolServeContext({
        cwd,
        host,
        port,
        projectDir,
        schemaRootPath,
        apiItemConfigPath,
        mainConfigPath,
        encoding,
        useDataFileFirst,
        dataFileRootPath,
        requiredOnly,
        alwaysFakeOptionals,
        optionalsProbability,
        prefixUrl,
      })
      const server = new ApiToolMockServer(context)
      await server.start()
    })
}
