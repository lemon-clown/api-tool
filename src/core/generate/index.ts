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
      const task = fs.writeFile(filepath, data, context.encoding)
        .then(() => logger.info(`output model: [${ modelName }] ${ filepath }`))
      tasks.push(task)
    }

    for (const item of context.apiItems) {
      const pn = path.join(context.schemaDir, item.group || '', item.name)
      if (!fs.existsSync(pn)) fs.mkdirpSync(pn)

      // RequestData
      const requestModel = context.generator.getSchemaForSymbol(item.requestModel)
      const requestModelName = `${ item.method }-request.json`.toLowerCase()
      doTask(item.requestModel, requestModel, path.join(pn, requestModelName))

      // ResponseData
      const responseModel = context.generator.getSchemaForSymbol(item.responseModel)
      const responseModelName = `${ item.method }-response.json`.toLowerCase()
      doTask(item.responseModel, responseModel, path.join(pn, responseModelName))
    }
  }
}


