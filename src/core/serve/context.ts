import path from 'path'
import { ApiItem, ApiItemParser } from '@/core/api-item'


/**
 * @member cwd                执行命令所在的目录
 * @member host               mock-server 监听的地址：ip/域名
 * @member port               mock-server 监听的端口
 * @member prefixUrl          url 前缀
 * @member projectDir         待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member schemaRootPath     生成的 Json-Schema 存放的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
 * @member apiItemConfigPath  定义 ApiItems 的文件路径（yaml 格式）
 * @member encoding           目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
 */
export interface ApiToolServeContextParams {
  host: string
  port: number
  projectDir: string
  schemaRootPath: string
  apiItemConfigPath: string
  cwd?: string
  prefixUrl?: string
  encoding?: string
}


/**
 * mock server 的上下文信息
 *
 * @member cwd              执行命令所在的目录
 * @member host             mock-server 监听的地址：ip/域名
 * @member port             mock-server 监听的端口
 * @member prefixUrl        url 前缀
 * @member projectDir       待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member schemaRootPath   生成的 Json-Schema 存放的文件夹（绝对路径）
 * @member apiItems         ApiItem 列表，描述
 * @member encoding         目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
 */
export class ApiToolServeContext {
  public readonly cwd: string
  public readonly host: string
  public readonly port: number
  public readonly prefixUrl: string
  public readonly projectDir: string
  public readonly schemaRootPath: string
  public readonly apiItems: ApiItem[]
  public readonly encoding: string

  public constructor (params: ApiToolServeContextParams) {
    const {
      cwd = process.cwd(),
      encoding = 'utf-8',
      prefixUrl= '',
      host,
      port,
      projectDir,
      schemaRootPath,
      apiItemConfigPath,
    } = params
    this.cwd = cwd
    this.host = host
    this.port = port
    this.prefixUrl = prefixUrl
    this.encoding = encoding
    this.projectDir = path.resolve(this.cwd, projectDir)
    this.schemaRootPath = path.resolve(this.projectDir, schemaRootPath)

    const apiItemParser = new ApiItemParser({
      schemaRootPath: this.schemaRootPath,
      encoding: this.encoding
    })
    apiItemParser.loadFromApiConfig(apiItemConfigPath)
    this.apiItems = apiItemParser.collect()
  }
}
