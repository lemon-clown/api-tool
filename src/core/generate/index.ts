import fs from 'fs-extra'
import * as TJS from '@lemon-clown/typescript-json-schema'
import { generateSchemaPaths } from '@/core/api-item'
import { logger } from '@/util/logger'
import { ApiToolGeneratorContext } from './context'


export class ApiToolGenerator {
  protected context: ApiToolGeneratorContext

  public constructor (context: ApiToolGeneratorContext) {
    this.context = context
  }

  /**
   * 生成 schemas
   */
  public async generate () {
    const { context } = this
    const tasks: Promise<void>[] = []
    const doTask = (modelName: string, model: TJS.Definition, filepath: string) => {
      const data = JSON.stringify(model, null, 2)
      const task = fs.writeFile(filepath, data, context.encoding)
        .then(() => logger.info(`output model: [${ modelName }] ${ filepath }`))
      tasks.push(task)
    }

    for (const item of context.apiItems) {
      const { requestSchemaPath, responseSchemaPath } = generateSchemaPaths(context.schemaDir, item, true)

      // RequestData / ResponseData
      const responseSchema = context.generator.getSchemaForSymbol(item.responseModel)
      const requestSchema = context.generator.getSchemaForSymbol(item.requestModel)
      doTask(item.requestModel, requestSchema, requestSchemaPath)
      doTask(item.responseModel, responseSchema, responseSchemaPath)
    }
  }
}
