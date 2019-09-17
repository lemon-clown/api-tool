# 功能描述

  * 通过 JsonSchema，生成 mock 数据
  * 通过解析 apiItemConfigPath 文件定义的内容，生成 mock-server

# 语法

  ```shell
  Usage: apit serve|s [options] <project-dir>

  Options:
    -h, --host <host>                               指定 mock-server 监听的本机 ip/域名 地址
    -p, --port <port>                               指定 mock-server 监听的本机端口；默认值为 8080
    -s, --schema-root-path <schemaRootPath>         指定 JsonSchema 的根目录
    -i, --api-item-config-path <apiItemConfigPath>  指定 api 条目的配置文件
    --prefix-url <prefixUrl>                        指定路由前缀
    --required-only                                 生成 mock 数据的选项：是否只包含 required 的属性
    --always-fake-optionals                         生成 mock 数据的选项：是否始终包含非 required 的属性
    --optionals-probability <optionalsProbability>  生成 mock 数据的选项：包含非 required 的属性的概率
    -h, --help                                      打印帮助信息
  ```

## 选项
  * `-h, --host <host>`:
    - 指定生成的 mock-server 监听的本机 ip/域名 地址
    - 默认值为 `localhost`

  * `-p, --port <port>`:
    - 指定生成的 mock-server 监听的本机端口
    - 默认值为 8080

  * `-s, --schema-root-path <schemaRootPath>`:
    - 指定 JsonSchema 的根目录；虽然这里可以包含任意的 JsonSchema 的目录，但是本命令的设计初衷是要和 `apit generate` 命令配合工作的，即此处应优先考虑使用 `apit generate` 的输出目录
    - 绝对路径或相对于 `projectDir` 的路径
    - 默认值： `data/schemas`

  * `-i, --api-item-config-path <apiItemConfigPath>`:
    - 指定 api 条目的配置文件
    - 绝对路径或相对于 `projectDir` 的路径
    - 默认值： `api.yml`

  * `--required-only`:
    - 生成的 mock 数据中是否只包含 `required` 的项
    - 详情可见 [json-schema-faker 文档][json-schema-faker:doc]
    - 默认值：`false`

  * `--always-fake-optionals`:
    - 生成的 mock 数据中是否始终包含 `optional` 的项
    - 详情可见 [json-schema-faker 文档][json-schema-faker:doc]
    - 默认值：`false`

  * `--optionals-probability <optionalsProbability>`:
    - 生成的 mock 数据中包含 `optional` 的项的概率
    - 详情可见 [json-schema-faker 文档][json-schema-faker:doc]
    - 默认值：0.8

  * `--help`: 打印帮助信息

[typescript-json-schema]: https://github.com/YousefED/typescript-json-schema
[json-schema-faker:doc]: https://github.com/json-schema-faker/json-schema-faker/blob/master/docs/USAGE.md#supported-keywords
