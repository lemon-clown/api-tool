import fs from 'fs-extra'
import path from 'path'
import * as TJS from '@lemon-clown/typescript-json-schema'
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
      const dirname = path.dirname(filepath)
      if (!fs.existsSync(dirname)) fs.mkdirpSync(dirname)
      const task = fs.writeFile(filepath, data, context.encoding)
        .then(() => logger.info(`output schema: [${ modelName }] ${ filepath }`))
      tasks.push(task)
    }

    for (const item of context.apiItems) {
      // RequestData
      const requestSchema = context.generator.getSchemaForSymbol(item.requestModel)
      doTask(item.requestModel, requestSchema, item.requestSchemaPath)

      // ResponseData
      const responseSchema = context.generator.getSchemaForSymbol(item.responseModel)
      doTask(item.responseModel, responseSchema, item.responseSchemaPath)
   }
  }
}
