import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { isNotBlankString, isNumberLike } from '@/util/type-util'
import { ApiToolServeContext } from './context'
import { ApiToolMockServer } from './server'
import { coverBoolean, coverNumber } from '@/util/option-util'
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
  requiredOnly: boolean
  alwaysFakeOptionals: boolean
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
    .option('-h, --host <host>', 'specify the ip/domain address to which the mock-server listens.', 'localhost')
    .option('-p, --port <port>', 'specify the port on which the mock-server listens.', 8080)
    .option('-s, --schema-root-path <schema-root-path>', 'specify the root directory (absolute or relative to the projectDir) to save schemas.', 'data/schemas')
    .option('-i, --api-item-config <api-item-config-path>', 'specify the location (absolute or relative to the projectDir) of file contains apiItems.', 'api.yml')
    .option('--prefix-url <prefix-url>', 'specify the prefix url of routes', '')
    .option('--required-only', 'json-schema-faker\'s option: if enabled, only required properties will be generated')
    .option('--always-fake-optionals', 'json-schema-faker\'s option: when enabled, it will set optionalsProbability: 1.0 and fixedProbabilities: true')
    .option('--optionals-probability <optionalsProbability>', 'json-schema-faker\'s option: a value from 0.0 to 1.0 to generate values in a consistent way', .8)
    .action(async function (projectDir: string, options: ServerOptions) {
      const cwd = globalOptions.cwd.value
      logger.debug('[serve] cwd:', cwd)
      logger.debug('[serve] rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const resolvePath = (key: keyof Pick<ServerOptions, 'schemaRootPath' | 'apiItemConfigPath'>, defaultValue: string) => {
        if (isNotBlankString(options[key])) return path.resolve(projectDir, options[key])
        return path.resolve(projectDir, defaultValue)
      }

      const host: string = isNotBlankString(options.host) ? options.host! : 'localhost'
      const port: number = Math.min(65536, Math.max(0, isNumberLike(options.port) ? Number.parseInt(options.port as any) : 8080))
      const prefixUrl: string = isNotBlankString(options.prefixUrl) ? options.prefixUrl! : ''
      const encoding = globalOptions.encoding.value
      const schemaRootPath = resolvePath('schemaRootPath', 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', 'api.yml')

      console.log('options.requiredOnly:', options.requiredOnly)
      console.log('options.alwaysFakeOptionals:', options.alwaysFakeOptionals)

      const requiredOnly = coverBoolean(false, options.requiredOnly)
      const alwaysFakeOptionals = coverBoolean(false, options.alwaysFakeOptionals)
      const optionalsProbability = coverNumber(.8, options.optionalsProbability)

      logger.debug('[serve] encoding:', encoding)
      logger.debug('[serve] projectDir:', projectDir)
      logger.debug('[serve] host:', host)
      logger.debug('[serve] port:', port)
      logger.debug('[serve] prefixUrl:', prefixUrl)
      logger.debug('[serve] schemaRootPath:', schemaRootPath)
      logger.debug('[serve] apiItemConfigPath:', apiItemConfigPath)
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
        encoding,
        requiredOnly,
        alwaysFakeOptionals,
        optionalsProbability,
        prefixUrl,
      })
      const server = new ApiToolMockServer(context)
      await server.start()
    })
}
