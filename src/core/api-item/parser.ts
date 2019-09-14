import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { isNotBlankString } from '@/util/type-util'
import { coverString, cover } from '@/util/option-util'
import { convertToCamel, convertToKebab } from '@/util/string-util'
import { HttpVerb, ApiItem, ApiItemGroup, RawApiItemGroup, RawApiItem } from './types'


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
   * 从 api 配置文件中加载数据
   *
   * @param configPath  .json/.yml/.yaml 后缀的文件
   * @param encoding
   */
  public loadFromApiConfig(configPath: string, encoding = this.encoding): ApiItem[] {
    const rawContent: string = fs.readFileSync(configPath, encoding)
    let content: any
    if (/\.json$/.test(configPath)) {               // json 格式
      content = JSON.parse(rawContent)
    }
    else if (/\.(yml|yaml)$/.test(configPath)) {    // yaml 格式
      content = yaml.safeLoad(rawContent)
    } else {
      throw new Error(`${ configPath } must be a file which the extension is .json/.yml/.yaml`)
    }

    const rawApiItemGroups: RawApiItemGroup[] = this.extractRawApiItemGroups(content)
    const items: ApiItem[] = []
    for (const rawApiItemGroup of rawApiItemGroups) {
      items.push(...this.parseFromRowItemGroup(rawApiItemGroup))
    }
    return items
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

    this.items.push(...apiItems)
    return apiItems
  }

  /**
   * 将对象解析为 RawApiItemGroup 列表
   * @param data
   */
  private extractRawApiItemGroups(data: any): RawApiItemGroup[] {
    if (typeof data !== 'object') return []
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
    if (typeof data !== 'object') return []
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
}
