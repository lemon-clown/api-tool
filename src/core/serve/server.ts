/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra'
import Koa from 'koa'
import http from 'http'
import Router from 'koa-router'
import koaJson from 'koa-json'
import { isFile } from '@/util/fs-util'
import { logger } from '@/util/logger'
import { accessLog } from './middleware/access-log'
import { ApiToolServeContext } from './context'
const koaCors = require('@koa/cors')
const jsf = require('json-schema-faker')


export class ApiToolMockServer {
  protected readonly context: ApiToolServeContext
  protected server: http.Server | null = null

  public constructor (context: ApiToolServeContext) {
    this.context = context
  }

  public async start(): Promise<void> {
    const { host, port } = this.context
    const app = new Koa()
    const router = await this.generateRoutes()

    app
      .use(accessLog())
      .use(koaCors())
      .use(koaJson())
      .use(router.routes())
      .use(router.allowedMethods())

    // start server
    const server = app.listen(port, host, () => {
      const url = `http://${ host }:${ port }`
      const address = JSON.stringify(server.address())
      logger.info(`address: ${ address }`)
      logger.info(`listening on ${ url }`)
    })

    this.server = server
  }

  /**
   * 停止服务器
   */
  public close (): void {
    if (this.server != null) {
      logger.info('server closing...')
      this.server.close()
      this.server = null
    }
  }

  /**
   * 根据 apiItem 构造路由
   */
  private async generateRoutes (): Promise<Router> {
    const { encoding, prefixUrl, apiItems } = this.context
    const router = new Router({ prefix: prefixUrl })
    for (const item of apiItems) {
      logger.info(`load router: ${ item.method.padEnd(6) } ${ prefixUrl }${ item.url } response(${ item.responseModel })`)
      router.register(item.url, [item.method], [
        async (ctx: Router.RouterContext) => {
          const schemaPath = item.responseSchemaPath
          if (!(await isFile(schemaPath))) {
            throw new Error(`bad schema: ${ schemaPath } is not found.`)
          }
          const schemaContent: string = await fs.readFile(schemaPath, encoding)
          const schema = JSON.parse(schemaContent)
          const data = jsf.generate(schema)
          ctx.body = data
        }
      ])
    }
    return router
  }
}
