import * as http from 'http'
import * as TJS from '@lemon-clown/typescript-json-schema'


declare namespace ApiTool {
  export enum HttpVerb {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DEL = 'DEL',
    DELETE = 'DELETE'
  }
  /**
   * api 组
   * @member name                 组名
   * @member url                  组内接口的 url 前缀
   * @member desc                 组描述
   * @member method               组内接口的默认 http 方法
   * @member model                组内接口定义的默认模型名称（构成最终名称的前缀部分）
   * @member requestModelSuffix   组内接口定义的请求对象默认模型名称后缀（构成最终名称的末尾部分）
   * @member responseModelSuffix  组内接口定义的响应对象默认模型名称后缀（构成最终名称的末尾部分）
   */
  export interface ApiItemGroup {
    name: string
    url: string
    method: HttpVerb
    desc: string
    model: string
    requestModelSuffix: string
    responseModelSuffix: string
  }
  /**
   * api 接口条目
   * @member name               接口名称
   * @member url                接口路径
   * @member desc               描述
   * @member method             http 方法
   * @member group              所属组的组名
   * @member requestModel       请求对象对应的模型名称（ts 接口/类型名，需保证唯一）
   * @member responseModel      响应对象对应的模型名称（ts 接口/类型名，需保证唯一）
   * @member requestSchemaPath  请求对象对应的 JSON-SCHEMA 的路径（绝对路径）
   * @member responseSchemaPath 响应对象对应的 JSON-SCHEMA 的路径（绝对路径）
   */
  export interface ApiItem {
    name: string
    url: string
    desc: string
    method: HttpVerb
    group: string
    requestSchemaPath: string
    responseSchemaPath: string
    requestModel?: string
    responseModel?: string
  }
  /**
   * 配置文件中的 api 条目，需要置于 api 组下
   *
   * @member name               api 条目的名称；构成自动生成的 requestModel、responseModel、requestSchemaPath、responseSchemaPath 的一部分
   * @member url                api 条目的路由（最终的路由以所属组中定义的 url 作为前缀）；default: ''
   * @member desc               api 条目的描述；default: ''
   * @member method             api 条目的 http 请求方法（覆盖 group 中的 method）；default: undefined
   * @member model              api 条目使用的模型名称（覆盖 group 中的 model）；default: undefined
   * @member requestModel       api 条目的请求数据对应的对象模型完整名称，指定该值，将使当前条目的 model 及其
   *                            所属组的 model、requestModelSuffix 失效；
   *                            若为 null，表示该 api 没有 RequestModel 模型；default: undefined
   * @member responseModel      api 条目的请求数据对应的对象模型完整名称，指定该值，将使当前条目的 model 及其
   *                            所属组的 model、responseModelSuffix 失效；
   *                            若为 null，表示该 api 没有 ResponseModel 模型；default: undefined
   * @member requestSchemaPath  请求对象对应的 JSON-SCHEMA 所在的路径（绝对路径或相对于 schema 根目录的路径）；default: undefined
   * @member responseSchemaPath 响应对象对应的 JSON-SCHEMA 所在的路径（绝对路径或相对于 schema 根目录的路径）；default: undefined
   */
  export interface RawApiItem {
    name: string
    url?: string
    desc?: string
    method?: HttpVerb
    model?: string
    requestModel?: string | null
    responseModel?: string | null
    requestSchemaPath?: string
    responseSchemaPath?: string
  }
  /**
   * 配置文件中的 api 组
   *
   * @member name                 api 组的名称
   * @member url                  api 组的公共 url 前缀；default: ''
   * @member desc                 api 组的描述；default: ''
   * @member method               api 组的 api 条目的默认 http 方法；default: GET
   * @member model                api 组的 api 条目的默认模型名称；default: ''
   * @member requestModelSuffix   和 model 共同生成 items 的默认 requestModel: Camel(<model><item.name><requestModelSuffix>)；default：'RequestVo'
   * @member responseModelSuffix  和 model 共同生成 items 的默认 responseModel: Camel(<model><item.name><responseModelSuffix>)；default：'ResponseVo'
   * @member items                属于该 api 组的 api 条目列表；default: []
   *
   * @example
   *
   *    * raw configs:
   *      ```yaml
   *      # api.yml
   *      blog:                         # group name
   *        url: /api/blog              # group prefix url
   *        model: Blog
   *        items:
   *          create:                   # items[0].name
   *            method: POST
   *            desc: create blog
   *          update:
   *            url: /:blogId
   *            method: POST
   *            desc: update blog
   *          queryById:
   *            url: /:blogId
   *            requestModel: null
   *            responseModel: QueryBlogByIdResponseVo
   *            desc: get blog by id
   *      ```
   *
   *    * parsed items:
   *      ```typescript
   *      [
   *        {
   *          url: '/api/blog',
   *          name: 'create'
   *          method: HttpVerb.POST,
   *          group: 'blog',
   *          requestSchemaPath: path.resolve(SCHEMA_PATH, 'blog/create-request.json'),
   *          responseSchemaPath: path.resolve(SCHEMA_PATH, 'blog/create-response.json'),
   *          requestModel: 'BlogCreateRequestVo',
   *          responseModel: 'BlogCreateResponseVo',
   *        },
   *        {
   *          url: '/api/blog/:blogId',
   *          name: 'update'
   *          method: HttpVerb.POST,
   *          group: 'blog',
   *          requestSchemaPath: path.resolve(SCHEMA_PATH, 'blog/update-request.json'),
   *          responseSchemaPath: path.resolve(SCHEMA_PATH, 'blog/update-response.json'),
   *          requestModel: 'BlogUpdateRequestVo',
   *          responseModel: 'BlogUpdateResponseVo',
   *        },
   *        {
   *          url: '/api/blog/:blogId',
   *          name: 'query-by-id'
   *          method: HttpVerb.GET,
   *          group: 'blog',
   *          requestSchemaPath: path.resolve(SCHEMA_PATH, 'blog/query-by-id-request.json'),
   *          responseSchemaPath: path.resolve(SCHEMA_PATH, 'blog/query-by-id-response.json'),
   *          requestModel: undefined,
   *          responseModel: 'QueryBlogByIdResponseVo',
   *        },
   *      ]
   *      ```
   */
  export interface RawApiItemGroup {
    name: string
    items: RawApiItem[]
    url?: string
    desc?: string
    method?: HttpVerb
    model?: string
    requestModelSuffix?: string
    responseModelSuffix?: string
  }

  /**
   *
   * @member schemaRootPath             JSON-SCHEMA 文件所在的根目录
   * @member defaultHttpMethod          api 组的默认 http 方法
   * @member defaultRequestModelSuffix  api 组的默认请求模型名称后缀
   * @member defaultResponseModelSuffix api 组的默认响应模型名称后缀
   */
  interface ApiItemParserParams {
    schemaRootPath: string
    encoding?: string
    defaultHttpMethod?: HttpVerb
    defaultRequestModelSuffix?: string
    defaultResponseModelSuffix?: string
  }

  export class ApiItemParser {
    private readonly items
    private readonly encoding
    private readonly schemaRootPath
    private readonly defaultHttpMethod
    private readonly defaultRequestModelSuffix
    private readonly defaultResponseModelSuffix
    constructor(params: ApiItemParserParams)
    /**
     * 收集所有当前实例解析到的 ApiItem
     */
    collect(): ApiItem[]
    /**
     * 加载当前工程下可以定义 api-item 的配置文件，并提取出 api-item 列表
     * @param mainConfigPath      主配置文件
     * @param apiItemConfigPath   api 配置文件
     * @param encoding
     */
    loadFromCurrentProjectConfig(mainConfigPath: string, apiItemConfigPath: string, encoding?: string): void
    /**
     * 从 api 配置文件中加载 ApiItems
     *
     * @param {string} configPath             .json/.yml/.yaml 后缀的文件
     * @param {*} [encoding=this.encoding]    文件编码格式
     * @returns {ApiItem[]}
     * @memberof ApiItemParser
     */
    loadFromApiConfig(configPath: string, encoding?: string): ApiItem[]
    /**
     * 从主配置文件中加载 ApiItems
     *
     * @param {string} configPath               .json/.yml/.yaml 后缀的文件
     * @param {string} [apiKey='api']           api-items 在配置文件中的顶级键名
     * @param {*} [encoding=this.encoding]      文件编码格式
     * @memberof ApiItemParser
     */
    loadFromMainConfig(configPath: string, apiKey?: string, encoding?: string): ApiItem[]
    /**
     * 从 RowItemGroup 中解析出 api 条目列表；该结果将收集进 this.items
     * @param {RawApiItemGroup} rawApiItemGroup
     * @returns {ApiItem[]}
     * @memberof ApiItemParser
     */
    parseFromRowItemGroup(rawApiItemGroup: RawApiItemGroup): ApiItem[]
    /**
     * 从配置文件的内容中解析出 ApiItem 列表
     *
     * @private
     * @param {*} content
     * @returns {ApiItem[]}
     * @memberof ApiItemParser
     */
    private parseFromConfigContent
    /**
     * 将对象解析为 RawApiItemGroup 列表
     * @param data
     */
    private extractRawApiItemGroups
    /**
     * 将对象解析为 RawApiItem 列表
     * @param data
     */
    private extractRawApiItems
    /**
     * 添加 apiItem 条目（去重）
     * @param apiItem
     */
    private addApiItem
  }

  /**
   * @member cwd                        执行命令所在的目录
   * @member tsconfigPath               tsconfig.json 所在的路径
   * @member schemaRootPath             生成的 Json-Schema 存放的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
   * @member ignoreMissingModels        忽略未找到的模型
   * @member apiItemConfigPath          定义 ApiItems 的文件路径（yaml 格式）
   * @member mainConfigPath             主配置文件所在的路径（通过 --config-path 选项指定的路径）
   * @member clean                      若为 true，则在生成 JSON-SCHEMA 之前，清空新生成 JSON-SCHEMA 待存放的文件夹
   * @member encoding                   目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * @member additionalSchemaArgs       额外的构建 Schema 的选项
   * @member additionalCompilerOptions  额外的 CompilerOptions 选项
   */
  export interface ApiToolGeneratorContextParams {
    tsconfigPath: string
    schemaRootPath: string
    apiItemConfigPath: string
    ignoreMissingModels: boolean
    mainConfigPath?: string
    clean?: boolean
    cwd?: string
    encoding?: string
    schemaArgs?: TJS.PartialArgs
    additionalCompilerOptions?: TJS.CompilerOptions
  }

  /**
  * 生成器的上下文信息
  *
  * @member cwd                  执行命令所在的目录
  * @member projectRootPath      待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
  * @member schemaRootPath       生成的 Json-Schema 存放的文件夹（绝对路径）
  * @member apiItems             ApiItem 列表，描述
  * @member encoding             目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
  * @member ignoreMissingModels  忽略未找到的模型
  * @member program              ts.Program: A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions' that represent a compilation unit.
  * @member generator            Json-Schema 生成器
  */
  export class ApiToolGeneratorContext {
    readonly cwd: string
    readonly projectRootPath: string
    readonly schemaRootPath: string
    readonly apiItems: ApiItem[]
    readonly encoding: string
    readonly ignoreMissingModels: boolean
    readonly clean: boolean
    readonly program: TJS.Program
    readonly generator: TJS.JsonSchemaGenerator
    constructor(params: ApiToolGeneratorContextParams)
    /**
     * create ts program instance
     * @param params
     */
    private buildProgram
  }

  export class ApiToolGenerator {
    protected readonly context: ApiToolGeneratorContext
    constructor(context: ApiToolGeneratorContext)
    /**
     * 生成 schemas
     */
    generate(): Promise<void>
    /**
     * 清空 JSON-SCHEMA 所在的目录
     */
    clear(): Promise<void>
  }

  /**
   * @member cwd                  执行命令所在的目录
   * @member host                 mock-server 监听的地址：ip/域名
   * @member port                 mock-server 监听的端口
   * @member prefixUrl            url 前缀
   * @member projectDir           待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
   * @member schemaRootPath       生成的 Json-Schema 存放的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
   * @member apiItemConfigPath    定义 ApiItems 的文件路径（yaml 格式）
   * @member mainConfigPath       主配置文件所在的路径（通过 --config-path 选项指定的路径）
   * @member encoding             目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
   * @member requiredOnly         是否只返回 JSON-SCHEMA 中 required 的属性
   * @member alwaysFakeOptionals  是否始终都返回所有的非 required 的属性
   * @member optionalsProbability 非 required 的属性出现在 mock 数据中的几率
   */
  export interface ApiToolServeContextParams {
    host: string
    port: number
    projectDir: string
    schemaRootPath: string
    apiItemConfigPath: string
    mainConfigPath?: string
    requiredOnly?: boolean
    alwaysFakeOptionals?: boolean
    optionalsProbability?: number
    cwd?: string
    prefixUrl?: string
    encoding?: string
  }

  /**
  * mock server 的上下文信息
  *
  * @member cwd                  执行命令所在的目录
  * @member host                 mock-server 监听的地址：ip/域名
  * @member port                 mock-server 监听的端口
  * @member prefixUrl            url 前缀
  * @member projectDir           待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
  * @member schemaRootPath       生成的 Json-Schema 存放的文件夹（绝对路径）
  * @member apiItems             ApiItem 列表，描述
  * @member encoding             目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
  * @member requiredOnly         是否只返回 JSON-SCHEMA 中 required 的属性
  * @member alwaysFakeOptionals  是否始终都返回所有的非 required 的属性
  * @member optionalsProbability 非 required 的属性出现在 mock 数据中的几率
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
    readonly requiredOnly: boolean
    readonly alwaysFakeOptionals: boolean
    readonly optionalsProbability: number
    constructor(params: ApiToolServeContextParams)
  }

  export class ApiToolMockServer {
    protected readonly context: ApiToolServeContext;
    protected server: http.Server | null;
    constructor(context: ApiToolServeContext);
    start(): Promise<void>;
    /**
     * 停止服务器
     */
    close(): void;
    /**
     * 根据 apiItem 构造路由
     */
    private generateRoutes;
  }
}


export = ApiTool
