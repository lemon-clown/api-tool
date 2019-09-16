import fs from 'fs-extra'
import path from 'path'
import { isNotBlankString } from '@/util/type-util'
import { coverString, cover } from '@/util/option-util'
import { convertToCamel, convertToKebab } from '@/util/string-util'
import { loadConfigDataSync } from '@/util/config-util'
import { HttpVerb, ApiItem, ApiItemGroup, RawApiItemGroup, RawApiItem } from './types'
import { logger } from '@/util/logger'


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
  private readonly items: ApiItem[]
  private readonly encoding: string
  private readonly schemaRootPath: string
  private readonly defaultHttpMethod: HttpVerb
  private readonly defaultRequestModelSuffix: string
  private readonly defaultResponseModelSuffix: string

  public constructor (params: ApiItemParserParams) {
    const {
      schemaRootPath,
      encoding = 'utf-8',
      defaultHttpMethod = HttpVerb.GET,
      defaultRequestModelSuffix = 'RequestVo',
      defaultResponseModelSuffix = 'ResponseVo',
    } = params

    this.items = []
    this.encoding = encoding
    this.schemaRootPath = schemaRootPath
    this.defaultHttpMethod = defaultHttpMethod
    this.defaultRequestModelSuffix = defaultRequestModelSuffix
    this.defaultResponseModelSuffix = defaultResponseModelSuffix
  }

  /**
   * 收集所有当前实例解析到的 ApiItem
   */
  public collect(): ApiItem[] {
    return [...this.items]
  }

  /**
   * 加载当前工程下可以定义 api-item 的配置文件，并提取出 api-item 列表
   * @param mainConfigPath      主配置文件
   * @param apiItemConfigPath   api 配置文件
   * @param encoding
   */
  public loadFromCurrentProjectConfig(mainConfigPath: string, apiItemConfigPath: string, encoding = this.encoding) {
    // 从主配置文件中加载 api-items
    if (isNotBlankString(mainConfigPath) && fs.existsSync(mainConfigPath!)) {
      this.loadFromMainConfig(mainConfigPath!, encoding)
    }

    // 从 api 文件中加载 api-items
    if (isNotBlankString(apiItemConfigPath) && fs.existsSync(apiItemConfigPath)) {
      this.loadFromApiConfig(apiItemConfigPath)
    }
  }

  /**
   * 从 api 配置文件中加载 ApiItems
   *
   * @param {string} configPath             .json/.yml/.yaml 后缀的文件
   * @param {*} [encoding=this.encoding]    文件编码格式
   * @returns {ApiItem[]}
   * @memberof ApiItemParser
   */
  public loadFromApiConfig(configPath: string, encoding = this.encoding): ApiItem[] {
    const content: any = loadConfigDataSync(configPath, encoding)
    return this.parseFromConfigContent(content)
  }


  /**
   * 从主配置文件中加载 ApiItems
   *
   * @param {string} configPath               .json/.yml/.yaml 后缀的文件
   * @param {string} [apiKey='api']           api-items 在配置文件中的顶级键名
   * @param {*} [encoding=this.encoding]      文件编码格式
   * @memberof ApiItemParser
   */
  public loadFromMainConfig (configPath: string, apiKey = 'api', encoding= this.encoding): ApiItem[] {
    const content: any = loadConfigDataSync(configPath, encoding)
    if (content == null || typeof content !== 'object') return []
    return this.parseFromConfigContent(content[apiKey])
  }

  /**
   * 从 RowItemGroup 中解析出 api 条目列表；该结果将收集进 this.items
   * @param {RawApiItemGroup} rawApiItemGroup
   * @returns {ApiItem[]}
   * @memberof ApiItemParser
   */
  public parseFromRowItemGroup (rawApiItemGroup: RawApiItemGroup): ApiItem[] {
    const apiItemGroup: ApiItemGroup = {
      name: rawApiItemGroup.name,
      url: coverString('', rawApiItemGroup.url),
      method: cover<HttpVerb>(this.defaultHttpMethod, rawApiItemGroup.method),
      desc: coverString('', rawApiItemGroup.desc),
      model: coverString('', rawApiItemGroup.model),
      requestModelSuffix: coverString(this.defaultRequestModelSuffix, rawApiItemGroup.requestModelSuffix),
      responseModelSuffix: coverString(this.defaultResponseModelSuffix, rawApiItemGroup.responseModelSuffix),
    }

    const rawApiItems: RawApiItem[] = cover([], rawApiItemGroup.items)
    const apiItems: ApiItem[] = []
    for (const rawItem of rawApiItems) {
      const name: string = rawItem.name
      const url: string = apiItemGroup.url + coverString('', rawItem.url)
      const desc: string = coverString('', rawItem.desc)
      const method: HttpVerb = cover<HttpVerb>(apiItemGroup.method, rawItem.method)
      const group: string = apiItemGroup.name
      const model: string = coverString(apiItemGroup.model, rawItem.model)

      /**
       * 计算 requestModel/responseModel 的名称，以 requestModel 为例
       * 1. 若 rawItem.requestModel === undefined，说明原配置文件中，此 api 未指定 requestModel，生成默认名称
       * 2. 若 rawItem.requestModel === null，说明此 api 没有 requestModel，赋值（apiItem）为 undefined
       * 3. 否则，以 item.requestModel 作为实际名称
       */
      let requestModel: string | undefined = rawItem.requestModel == null ? undefined : rawItem.requestModel
      let responseModel: string | undefined = rawItem.responseModel == null ? undefined : rawItem.responseModel
      if (rawItem.requestModel === undefined) {
        requestModel = convertToCamel(`${ model }-${ name }-${ apiItemGroup.requestModelSuffix }`, true)
      }
      if (rawItem.responseModel === undefined) {
        responseModel = convertToCamel(`${ model }-${ name }-${ apiItemGroup.responseModelSuffix }`, true)
      }

      /**
       * 计算 requestSchemaPath/responseSchemaPath，以 requestSchemaPath 为例
       * 1. 若 rawItem.requestSchemaPath 为非空字符串，则将 rawItem.requestSchemaPath 作
       *    为 requestSchemaPath（绝对路径或相对于 schema 根目录的路径）
       * 2. 否则，生成默认的 schema 路径
       */
      const pn = path.join(this.schemaRootPath, group)
      const requestSchemaName = convertToKebab(`${ name }-request.json`)
      const responseSchemaName = convertToKebab(`${ name }-response.json`)
      const requestSchemaPath = isNotBlankString(rawItem.requestSchemaPath)
        ? path.resolve(this.schemaRootPath, rawItem.requestSchemaPath!)
        : path.join(pn, requestSchemaName)
      const responseSchemaPath = isNotBlankString(rawItem.responseSchemaPath)
        ? path.resolve(this.schemaRootPath, rawItem.responseSchemaPath!)
        : path.join(pn, responseSchemaName)

      const apiItem: ApiItem = {
        name, url, desc, method, group,
        requestModel, responseModel, requestSchemaPath, responseSchemaPath
      }
      apiItems.push(apiItem)
    }

    apiItems.forEach(apiItem => this.addApiItem(apiItem))
    return apiItems
  }

  /**
   * 从配置文件的内容中解析出 ApiItem 列表
   *
   * @private
   * @param {*} content
   * @returns {ApiItem[]}
   * @memberof ApiItemParser
   */
  private parseFromConfigContent (content: any): ApiItem[] {
    const rawApiItemGroups: RawApiItemGroup[] = this.extractRawApiItemGroups(content)
    const items: ApiItem[] = []
    for (const rawApiItemGroup of rawApiItemGroups) {
      items.push(...this.parseFromRowItemGroup(rawApiItemGroup))
    }
    return items
  }

  /**
   * 将对象解析为 RawApiItemGroup 列表
   * @param data
   */
  private extractRawApiItemGroups(data: any): RawApiItemGroup[] {
    if (data == null || typeof data !== 'object') return []
    const rawApiItemGroups: RawApiItemGroup[] = []
    for (const [groupName, rawGroup] of Object.entries<RawApiItemGroup>(data)) {
      const items: RawApiItem[] = this.extractRawApiItems(rawGroup.items)
      const { url, desc, method, model, requestModelSuffix, responseModelSuffix } = rawGroup
      const rawApiItemGroup: RawApiItemGroup = {
        name: groupName, items, url, desc, method,
        model, requestModelSuffix, responseModelSuffix,
      }
      rawApiItemGroups.push(rawApiItemGroup)
    }
    return rawApiItemGroups
  }

  /**
   * 将对象解析为 RawApiItem 列表
   * @param data
   */
  private extractRawApiItems(data: any): RawApiItem[] {
    if (data == null || typeof data !== 'object') return []
    const rawApiItems: RawApiItem[] = []
    for (const [name, rawItem] of Object.entries<RawApiItem>(data)) {
      const { url, desc, method, model, requestModel, responseModel, requestSchemaPath, responseSchemaPath } = rawItem
      const rawApiItem: RawApiItem = {
        name, url, desc, method, model,
        requestModel, responseModel, requestSchemaPath, responseSchemaPath
      }
      rawApiItems.push(rawApiItem)
    }
    return rawApiItems
  }

  /**
   * 添加 apiItem 条目（去重）
   * @param apiItem
   */
  private addApiItem (apiItem: ApiItem) {
    const existsApiItem = this.items.find(item => item.method === apiItem.method && item.url === apiItem.url)
    if (existsApiItem != null) {
      logger.warn(`duplicated api-items: method(${ apiItem.method }) url(${ apiItem.url }). skipped`)
      return
    }
    this.items.push(apiItem)
  }
}
