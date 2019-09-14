import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { isNotBlankString } from '@/util/type-util'
import { coverBoolean, coverString, coverStringForCliOption } from '@/util/option-util'
import { parseApiToolConfig } from '@/util/config-util'
import { ApiToolGeneratorContext, ApiToolGeneratorContextParams } from './context'
import { ApiToolGenerator } from './generator'
export { ApiToolGeneratorContext } from './context'
export { ApiToolGenerator } from './generator'


/**
 * generate 命令的参数选项
 *
 * @member tsconfigPath         tsconfig.json 所在的路径
 * @member schemaRootPath       生成的 Json-Schema 存放的文件夹
 * @member apiItemConfigPath    定义 ApiItems 的文件路径（yaml 格式）
 * @member configPath           json 格式的配置文件，通过此文件构造 ApiToolGeneratorContextParams（低优先级）；
 *                              此配置文件内容与 ApiToolGeneratorContextParams 类型保持一直，用来指定改变 generator 行为的参数
 * @member ignoreMissingModels  忽略未找到的模型
 */
export interface GenerateOptions {
  tsconfigPath: string
  schemaRootPath: string
  apiItemConfigPath: string
  configPath: string
  ignoreMissingModels: boolean
}


export function loadGenerateCommand (program: commander.Command, globalOptions: GlobalOptions) {
  program
    .command('generate <project-dir>')
    .alias('g')
    .option('-p, --tsconfig-path <tsconfig-path>', 'specify the location (absolute or relative to the projectDir) of typescript config file.', 'tsconfig.json')
    .option('-s, --schema-root-path <schema-root-path>', 'specify the root directory (absolute or relative to the projectDir) to save schemas.', 'data/schemas')
    .option('-i, --api-item-config <api-item-config-path>', 'specify the location (absolute or relative to the projectDir) of file contains apiItems.', 'api.yml')
    .option('-c, --config-path <config-path>', 'specify config file (absolute or relative to the projectDir) to create context params (lower priority)', 'app.yml')
    .option('-I, --ignore-missing-models', 'ignore missing model')
    .action(async function (projectDir: string, options: GenerateOptions) {
      const cwd = globalOptions.cwd.value

      logger.debug('[generate] cwd:', cwd)
      logger.debug('[generate] rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const configPath = path.resolve(projectDir, coverString('app.yml', options.configPath))
      const contextParams: Partial<ApiToolGeneratorContextParams> = parseApiToolConfig(configPath, 'serve')
      // 计算路径
      const resolvePath = (key: keyof Pick<ApiToolGeneratorContextParams, 'tsconfigPath' | 'schemaRootPath' | 'apiItemConfigPath'>, defaultValue: string): string => {
        const value = coverStringForCliOption(defaultValue, contextParams[key], options[key])
        return path.resolve(projectDir, value)
      }

      const tsconfigPath = resolvePath('tsconfigPath', contextParams.tsconfigPath || 'tsconfig.json')
      const schemaRootPath = resolvePath('schemaRootPath', contextParams.schemaRootPath || 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', contextParams.apiItemConfigPath || 'api.yml')
      const ignoreMissingModels = coverBoolean(false, coverBoolean(contextParams.ignoreMissingModels!, options.ignoreMissingModels))
      const encoding = !globalOptions.encoding.userSpecified && isNotBlankString(contextParams.encoding)
        ? contextParams.encoding!
        : globalOptions.encoding.value

      logger.debug('[generate] encoding:', encoding)
      logger.debug('[generate] projectDir:', projectDir)
      logger.debug('[generate] configPath:', configPath)
      logger.debug('[generate] tsconfigPath:', tsconfigPath)
      logger.debug('[generate] schemaRootPath:', schemaRootPath)
      logger.debug('[generate] apiItemConfigPath:', apiItemConfigPath)
      logger.debug('[generate] ignoreMissingModels:', ignoreMissingModels)
      logger.debug('[generate] contextParams:', contextParams)
      logger.debug('[generate] globalOptions:', globalOptions)

      const context = new ApiToolGeneratorContext({
        ...contextParams,
        cwd,
        encoding,
        tsconfigPath,
        schemaRootPath,
        apiItemConfigPath,
        ignoreMissingModels,
      })
      const generator = new ApiToolGenerator(context)
      await generator.generate()
    })
}
