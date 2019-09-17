# 功能描述

  * 简单地来说，这个工具的作用是：ts 类型 --> JSON-SCHEMA --> mock-data --> mock-server
    - `ts 类型 --> JSON-SCHEMA`: 即把 ts 定义的类型转为 [json-schema][]，可见 [typescript-json-schema][]
    - `JSON-SCHEMA --> mock-data`: 即通过 `json-schema` 生成 mock 数据，可见 [json-schema-faker][]
    - `mock-data --> mock-server`: 即通过配置文件定义模型（json-schema/ts 类型）和 api 的关系，以生成 `mock-server`，配置文件可参考 [demo/simple/api.yml][]

  * 安装
    ```shell
    npm install -g @lemon-clown/api-tool
    # or
    yarn global add @lemon-clown/api-tool
    ```

# 语法

  ```shell
  Usage: apit [options] [command]

  Options:
    -V, --version                       输出当前工具的版本号
    -c, --config-path <config-path>     指定配置文件所在的位置
    --encoding <encoding>               指定目标工程的文件编码
    --log-level <level>                 指定日志级别
    -h, --help                          output usage information

  Commands:
    generate|g [options] <project-dir>
    serve|s [options] <project-dir>
  ```

## 选项

  * `-V, --version`: 输出当前工具的版本号

  * `-c, --config-path <config-path>`:
    - 指定配置文件所在的位置，需以 `.json` 或 `.yml` 或 `.yaml` 为后缀
    - 绝对路径或相对目标工程的根目录（在子命令中可以得到此根目录）的路径
    - 默认值：`app.yml`

  * `--encoding <encoding>`:
    - 指定目标工程的文件编码
    - 默认值：`utf-8`

  * `--log-level`:
    - 日志的级别，可见 [colorful-chalk-logger options][]
    - 默认值：`info`

  * `--config-path`:
    - 配置文件中包含 4 个块，均为可选项：
      - `globalOptions`: 定义全局选项，当前支持：
        - `encoding`: 对应 `--encoding`
        - `logLevel`: 对应 `--log-level`

      - `generate`: generate 子命令的选项，当前支持：
        - `clean`: 对应子命令中的 `--clean`
        - `schemaRootPath`: 对应子命令中的 `--schema-root-path`
        - `tsconfigPath`: 对应子命令中的 `--tsconfig-path`
        - `apiItemConfigPath`: 对应子命令中的 `----api-item-config-path`
        - `ignoreMissingModels`: 对应子命令中的 `--ignore-missing-models`
        - `schemaArgs`: ts 生成 JSON-SCHEMA 的一些配置，可见 [typescript-json-schema schemaArgs][]

      - `serve`: serve 子命令的选项，当前支持：
        - `host`: 对应子命令中的 `--host`
        - `port`: 对应子命令中的 `--port`
        - `schemaRootPath`: 对应子命令中的 `--schema-root-path`
        - `apiItemConfigPath`: 对应子命令中的 `--api-item-config-path`
        - `requiredOnly`: 对应子命令中的 `--required-only`
        - `alwaysFakeOptions`: 对应子命令中的 `--always-fake-optionals`
        - `optionalsProbability`: 对应子命令中的 `--optionals-probability`

      - `api`: api 组，其内容和 `apiItemConfigPath` 中定义的格式一致，可参考 [demo/simple/api.yml][]

    - 可参考 [demo/simple/app.yml][]

  * `--help`: 打印帮助信息

## 子命令

  * `apit generate`: 见 [api generate][]
  * `apit serve`: 见 [api serve][]

## apiItemConfig

  * 该文件定义一个对象，其中第一层键名均为 `group name`，第二层键名为该组下的 `api item`
  * 第一层对象定义了一些公共属性即默认属性，见 [apiItemConfig RawApiItemGroup][]
    ```typescript
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
    ```
  * 第二层对象定义了 api 的路径、http方法、请求模型名、响应模型名，见 [apiItemConfig RawApiItem][]
    ```typescript
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
    ```
  * 参见 [demo/simple/api.yml][]

[api generate]: ./generate.md
[api serve]: ./serve.md
[demo/simple/api.yml]: ../demo/simple/api.yml
[demo/simple/app.yml]: ../demo/simple/app.yml
[colorful-chalk-logger options]: https://www.npmjs.com/package/colorful-chalk-logger#cli-options
[json-schema]: https://json-schema.org/
[json-schema-faker]: https://github.com/json-schema-faker/json-schema-faker
[typescript-json-schema schemaArgs]: https://github.com/lemon-clown/typescript-json-schema/blob/master/src/types.ts#L65
[typescript-json-schema]: https://github.com/lemon-clown/typescript-json-schema
[apiItemConfig RawApiItem]: https://github.com/lemon-clown/api-tool/blob/develop/src/core/api-item/types.ts#L77
[apiItemConfig RawApiItemGroup]: https://github.com/lemon-clown/api-tool/blob/develop/src/core/api-item/types.ts#L162
