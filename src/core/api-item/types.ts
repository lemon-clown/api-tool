export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DEL = 'DEL',
  DELETE = 'DELETE',
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
 * @member name               接口名称（英文名称）
 * @member title              接口名称（中文名称，当配置文件中未指定 title，该值置为 name 的值）
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
  title: string
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
 * @member title              api 条目的名称（中文名称）
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
  title?: string
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
