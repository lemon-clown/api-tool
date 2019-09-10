import path from 'path'
import commander from 'commander'
import { GlobalOptions } from '@/types'
import { logger } from '@/util/logger'
import { isNotBlankString } from '@/util/type-util'
import { ApiToolGeneratorContext } from './context'
import { ApiToolGenerator } from './generator'
export { ApiToolGeneratorContext } from './context'
export { ApiToolGenerator } from './generator'


export interface GenerateOptions {
  tsconfigPath: string
  schemaRootPath: string
  apiItemConfigPath: string
}


export function loadGenerateCommand (program: commander.Command, globalOptions: GlobalOptions) {
  program
    .command('generate <project-dir>')
    .alias('g')
    .option('-p, --tsconfig <tsconfig-path>', 'specify the location of typescript config file (absolute or relative to the projectDir).', 'tsconfig.json')
    .option('-s, --schema-root-path <schema-root-path>', 'specify the root directory to save schemas (absolute or relative to the projectDir).', 'data/schemas')
    .option('-i, --api-item-config <api-item-config-path', 'specify the location of file contains apiItems (absolute or relative to the projectDir).', 'api.yml')
    .action(async function (projectDir: string, options: GenerateOptions) {
      const { cwd, encoding } = globalOptions

      logger.debug('cwd:', cwd)
      logger.debug('rawProjectDir:', projectDir)

      projectDir = path.resolve(cwd, projectDir)
      const resolvePath = (key: keyof GenerateOptions, defaultValue: string) => {
        if (isNotBlankString(options[key])) return path.resolve(projectDir, options[key])
        return path.resolve(projectDir, defaultValue)
      }

      const tsconfigPath = resolvePath('tsconfigPath', 'tsconfig.json')
      const schemaRootPath = resolvePath('schemaRootPath', 'data/schemas')
      const apiItemConfigPath = resolvePath('apiItemConfigPath', 'api.yml')

      logger.debug('projectDir:', projectDir)
      logger.debug('tsconfigPath:', tsconfigPath)
      logger.debug('schemaRootPath:', schemaRootPath)
      logger.debug('apiItemConfigPath:', apiItemConfigPath)
      logger.debug('globalOptions:', globalOptions)

      const context = new ApiToolGeneratorContext({
        cwd,
        encoding,
        tsconfigPath,
        schemaRootPath,
        apiItemConfigPath
      })
      const generator = new ApiToolGenerator(context)
      await generator.generate()
    })
}
