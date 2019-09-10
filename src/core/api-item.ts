import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { isNotBlankString } from '@/util/type-util'


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
export function loadApiItemConfig (schemaRootPath: string, apiItemConfigPath: string, encoding = 'utf-8'): ApiItem[] {
  const rawContent: string = fs.readFileSync(apiItemConfigPath, encoding)
  const content = yaml.safeLoad(rawContent)
  const result: ApiItem[] = []
  if (typeof content !== 'object') return result

  for (const [key, val] of Object.entries(content)) {
    if (typeof val !== 'object') continue
    const {
      url, method, name = key, desc = '', group = '', groupName = '',
      requestModel, responseModel, requestSchemaPath, responseSchemaPath
    } = val as any

    // 检查是否是合法的 api-item，非法的将跳过
    if (
      isNotBlankString(url)
      && isNotBlankString(method)
      && isNotBlankString(name)
      && isNotBlankString(requestModel)
      && isNotBlankString(responseModel)
    ) {
      const pn = path.join(schemaRootPath, group || '', name)
      const requestSchemaName = `${ method }-request.json`.toLowerCase()
      const responseSchemaName = `${ method }-response.json`.toLowerCase()
      const resolvedRequestSchemaPath =  requestSchemaPath || path.join(pn, requestSchemaName)
      const resolvedResponseSchemaPath = responseSchemaPath || path.join(pn, responseSchemaName)
      result.push({
        url, method, name, desc, group, groupName, requestModel, responseModel,
        requestSchemaPath: resolvedRequestSchemaPath, responseSchemaPath: resolvedResponseSchemaPath
      })
    }
  }
  return result
}
