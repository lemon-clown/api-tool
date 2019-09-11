import * as TJS from '@lemon-clown/typescript-json-schema'


declare namespace ApiTool {
  /**
   *
   * @member url                api 路径
   * @member method             请求方法
   * @member name               接口名称（英文名）
   * @member desc               接口的描述（可中文）
   * @member group              接口所属的组（英文名）
   * @member groupName          接口所属的组（英文名）
   * @member requestModel       请求数据的数据模型（ts 接口名，需保证唯一）
   * @member responseModel      响应数据的数据模型（ts 接口名，需保证唯一）
   * @member requestSchemaPath  请求数据的数据模型所在的路径（配置文件中可选）
   * @member responseSchemaPath 响应数据的数据模型所在的路径（配置文件中可选）
   */
  export interface ApiItem {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DEL' | 'DELETE'
    name: string
    requestModel: string
    responseModel: string
    requestSchemaPath: string
    responseSchemaPath: string
    desc?: string
    group?: string
    groupName?: string
  }

  /**
   * 加载 api 条目
   *
   * @param schemaRootPath    schema 所在的根目录（用于在 requestSchemaPath/responseSchemaPath 未指定时，生成路径）
   * @param apiItemConfigPath 配置文件所在路径
   * @param encoding          文件所有编码格式
   */
  export function loadApiItemConfig(schemaRootPath: string, apiItemConfigPath: string, encoding?: string): ApiItem[]

  /**
   * @member cwd                        执行命令所在的目录
   * @member tsconfigPath               tsconfig.json 所在的路径
   * @member schemaRootPath             生成的 Json-Schema 存放的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
   * @member apiItemConfigPath          定义 ApiItems 的文件路径（yaml 格式）
   * @member encoding                   目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * @member additionalSchemaArgs       额外的构建 Schema 的选项
   * @member additionalCompilerOptions  额外的 CompilerOptions 选项
   */
  export interface ApiToolGeneratorContextParams {
    tsconfigPath: string
    schemaRootPath: string
    apiItemConfigPath: string
    cwd?: string
    encoding?: string
    schemaArgs?: TJS.PartialArgs
    additionalCompilerOptions?: TJS.CompilerOptions
  }

  /**
   * 通过 json 格式的文件构造 ApiToolGeneratorContextParams
   *
   * @param contextParamsConfigPath   json 格式的配置文件
   */
  export function parseApiToolGeneratorContextParams(contextParamsConfigPath: string): Partial<ApiToolGeneratorContextParams>

  /**
   * 生成器的上下文信息
   *
   * @member cwd              执行命令所在的目录
   * @member projectRootPath  待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
   * @member schemaRootPath   生成的 Json-Schema 存放的文件夹（绝对路径）
   * @member apiItems         ApiItem 列表，描述
   * @member encoding         目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
   * @member program          ts.Program: A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions' that represent a compilation unit.
   * @member generator        Json-Schema 生成器
   */
  export class ApiToolGeneratorContext {
    readonly cwd: string
    readonly projectRootPath: string
    readonly schemaRootPath: string
    readonly apiItems: ApiItem[]
    readonly encoding: string
    readonly program: TJS.Program
    readonly generator: TJS.JsonSchemaGenerator
    constructor(params: ApiToolGeneratorContextParams)
  }

  export class ApiToolGenerator {
    protected readonly context: ApiToolGeneratorContext
    constructor(context: ApiToolGeneratorContext)
    /**
     * 生成 schemas
     */
    generate(): Promise<void>
  }

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
    readonly cwd: string
    readonly host: string
    readonly port: number
    readonly prefixUrl: string
    readonly projectDir: string
    readonly schemaRootPath: string
    readonly apiItems: ApiItem[]
    readonly encoding: string
    constructor(params: ApiToolServeContextParams)
  }
}


export = ApiTool
