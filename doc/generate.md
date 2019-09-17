# 功能描述

  * 扫描 ts 工程，将配置文件中定义的 request/response 模型生成 json-schema
  * 关于 ts 类型生成 json-schema 可见 [typescript-json-schema][]

# 语法

  ```shell
  Usage: apit generate|g [options] <project-dir>

  Options:
    -p, --tsconfig-path <tsconfigPath>              指定 tsconfig.json 所在的位置
    -s, --schema-root-path <schemaRootPath>         指定 JsonSchema 的输出目录
    -i, --api-item-config-path <apiItemConfigPath>  指定 api 条目的配置文件
    -I, --ignore-missing-models                     在 api 条目中指定（或默认解析得到的）模型不存在时，忽略这个异常（但会记录消息）
    --clean                                         在生成 JsonSchema 之前清空 JsonSchema 的输出目录
    -h, --help                                      打印帮助信息
  ```

## 选项
  * `-p, --tsconfig-path <tsconfigPath>`:
    - 指定 `tsconfig.json` 文件所在的位置
    - 绝对路径或相对于 `projectDir` 的路径
    - 默认值： `tsconfig.json`

  * `-s, --schema-root-path <schemaRootPath>`:
    - 指定 JsonSchema 的输出目录
    - 绝对路径或相对于 `projectDir` 的路径
    - 默认值： `data/schemas`

  * `-i, --api-item-config-path <apiItemConfigPath>`:
    - 指定 api 条目的配置文件，需以 `.json` 或 `.yml` 或 `.yaml` 为后缀
    - 绝对路径或相对于 `projectDir` 的路径
    - 可见 [apiItemConfig][]
    - 默认值： `api.yml`

  * `-I, --ignore-missing-models`:
    - 在 api 条目中指定（或默认解析得到的）模型不存在时，忽略这个异常（但会记录消息）
    - 默认值：false

  * `--clean`:
    - 在生成 JsonSchema 之前清空 JsonSchema 的输出目录
    - 默认值：false

  * `--help`: 打印帮助信息

[typescript-json-schema]: https://github.com/YousefED/typescript-json-schema
[apiItemConfig]: ./README.md#apiItemConfig
