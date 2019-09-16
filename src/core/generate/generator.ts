import fs from 'fs-extra'
import path from 'path'
import * as TJS from '@lemon-clown/typescript-json-schema'
import { logger } from '@/util/logger'
import { ApiToolGeneratorContext } from './context'


export class ApiToolGenerator {
  protected readonly context: ApiToolGeneratorContext

  public constructor (context: ApiToolGeneratorContext) {
    this.context = context
  }

  /**
   * 生成 schemas
   */
  public async generate () {
    const { context } = this
    const tasks: Promise<void>[] = []
    const doTask = (modelName: string, filepath: string) => {
      // 如果模型未找到，则跳过
      const symbols = context.generator.getSymbols(modelName)
      if (symbols.length <= 0) {
        if (context.ignoreMissingModels) {
          logger.info(`cannot find ${ modelName }. skipped.`)
          return
        }
        throw new Error(`${ modelName } not found.`)
      }

      const model: TJS.Definition = context.generator.getSchemaForSymbol(modelName)
      if (model.title == null) model.title = modelName
      const data = JSON.stringify(model, null, 2)
      const dirname = path.dirname(filepath)
      if (!fs.existsSync(dirname)) fs.mkdirpSync(dirname)
      const task = fs.writeFile(filepath, data, context.encoding)
        .then(() => logger.info(`output schema: [${ modelName }] ${ filepath }`))
      tasks.push(task)
    }

    // 在生成 JSON-SCHEMA 前，做一些清理操作
    if (context.clean) {
      await this.clear()
    }

    for (const item of context.apiItems) {
      // RequestData
      if (item.requestModel != null) {
        doTask(item.requestModel, item.requestSchemaPath)
      }

      // ResponseData
      if (item.responseModel != null) {
        doTask(item.responseModel, item.responseSchemaPath)
      }
    }
  }

  /**
   * 清空 JSON-SCHEMA 所在的目录
   */
  public async clear(): Promise<void> {
    const targetDirectory = this.context.schemaRootPath
    logger.info(`clearing schemas root path: ${ targetDirectory }.`)
    await fs.remove(targetDirectory)
  }
}
