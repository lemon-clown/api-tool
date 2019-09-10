import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { isNotBlankString } from '@/util/type-util'


/**
 *
 * @member url            api 路径
 * @member method         请求方法
 * @member name           接口名称（英文名）
 * @member desc           接口的描述（可中文）
 * @member group          接口所属的组（英文名）
 * @member groupName      接口所属的组（英文名）
 * @member requestModel   请求数据的数据模型（ts 接口名，需保证唯一）
 * @member responseModel  响应数据的数据模型（ts 接口名，需保证唯一）
 */
export interface ApiItem {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DEL' | 'DELETE'
  name: string
  requestModel: string
  responseModel: string
  desc?: string
  group?: string
  groupName?: string
}


/**
 * 加载 api 条目
 * @param apiItemConfigPath 配置文件所在路径
 * @param encoding          文件所有编码格式
 */
export function loadApiItemConfig (apiItemConfigPath: string, encoding = 'utf-8'): ApiItem[] {
  const rawContent: string = fs.readFileSync(apiItemConfigPath, encoding)
  const content = yaml.safeLoad(rawContent)
  const result: ApiItem[] = []
  if (typeof content !== 'object') return result

  for (const [key, val] of Object.entries(content)) {
    if (typeof val !== 'object') continue
    const { url, method, name = key, desc='', group='', groupName='', requestModel, responseModel } = val as any
    // 检查是否是合法的 api-item，非法的将跳过
    if (
      isNotBlankString(url)
      && isNotBlankString(method)
      && isNotBlankString(name)
      && isNotBlankString(requestModel)
      && isNotBlankString(responseModel)
    ) {
      result.push({ url, method, name, desc, group, groupName, requestModel, responseModel })
    }
  }
  return result
}



/**
 * @member requestSchemaPath  requestSchema 的路径
 * @member responseSchemaPath responseSchema 的路径
 */
export interface SchemaPaths {
  requestSchemaPath: string
  responseSchemaPath: string
}


/**
 * 生成 request/response 数据对应的 schema 所在的路径
 *
 * @param schemaDir
 * @param item
 * @param createIfNotExists   若中间路径不存在，是否进行创建
 */
export function generateSchemaPaths(schemaDir: string, item: ApiItem, createIfNotExists: boolean): SchemaPaths | never {
  const pn = path.join(schemaDir, item.group || '', item.name)
  if (!fs.existsSync(pn)) {
    if (createIfNotExists) fs.mkdirpSync(pn)
    else {
      throw new Error(`[generateSchemaPath]: ${ pn } is not exists.`)
    }
  }

  const requestSchemaName = `${ item.method }-request.json`.toLowerCase()
  const responseSchemaName = `${ item.method }-response.json`.toLowerCase()
  return {
    requestSchemaPath: path.join(pn, requestSchemaName),
    responseSchemaPath: path.join(pn, responseSchemaName)
  }
}
