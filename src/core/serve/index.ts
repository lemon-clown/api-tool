import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { isNotBlankString, isNumberLike } from '@/util/type-util'
import { ApiToolServeContext } from './context'
import { ApiToolMockServer } from './server'
export { ApiToolServeContext, ApiToolServeContextParams } from './context'
export { ApiToolMockServer } from './server'


/**
 * serve 命令的参数选项
 *
 * @member tsconfigPath       tsconfig.json 所在的路径
 * @member schemaRootPath     生成的 Json-Schema 存放的文件夹
 * @member apiItemConfigPath  定义 ApiItems 的文件路径（yaml 格式）
 * @member configPath         json 格式的配置文件，通过此文件构造 ApiToolGeneratorContextParams（低优先级）；
 *                            此配置文件内容与 ApiToolGeneratorContextParams 类型保持一直，用来指定改变 generator 行为的参数
 */
export interface ServerOptions {
  host: string
  port: number
  schemaRootPath: string
  apiItemConfigPath: string
  prefixUrl: string
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
    .action(async function (projectDir: string, options: ServerOptions) {
      const cwd = globalOptions.cwd.value
      logger.debug('[generate] cwd:', cwd)
      logger.debug('[generate] rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const resolvePath = (key: keyof Omit<ServerOptions, 'port'>, defaultValue: string) => {
        if (isNotBlankString(options[key])) return path.resolve(projectDir, options[key])
        return path.resolve(projectDir, defaultValue)
      }

      const host: string = isNotBlankString(options.host) ? options.host! : 'localhost'
      const prefixUrl: string = isNotBlankString(options.prefixUrl) ? options.prefixUrl! : ''
      const port: number = Math.min(65536, Math.max(0, isNumberLike(options.port) ? Number.parseInt(options.port as any) : 8080))
      const encoding = globalOptions.encoding.value
      const schemaRootPath = resolvePath('schemaRootPath', 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', 'api.yml')
      const context = new ApiToolServeContext({
        cwd,
        host,
        port,
        projectDir,
        schemaRootPath,
        apiItemConfigPath,
        encoding,
        prefixUrl,
      })
      const server = new ApiToolMockServer(context)
      await server.start()
    })
}
