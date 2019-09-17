# 功能描述

  * 简单地来说，这个工具的作用是：ts 类型 --> JSON-SCHEMA --> mock-data --> mock-server
    - `ts 类型 --> JSON-SCHEMA`: 即把 ts 定义的类型转为 [json-schema][]，可见 [typescript-json-schema][]
    - `JSON-SCHEMA --> mock-data`: 即通过 `json-schema` 生成 mock 数据，可见 [json-schema-faker][]
    - `mock-data --> mock-server`: 即通过配置文件定义模型（json-schema/ts 类型）和 api 的关系，以生成 `mock-server`，配置文件可参考 [demo/simple/api.yml][]

  * 安装
    ```shell
    npm install -g api-tool
    # or
    yarn global add api-tool
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


[api generate]: ./generate.md
[api serve]: ./serve.md
[demo/simple/api.yml]: ../demo/simple/api.yml
[demo/simple/app.yml]: ../demo/simple/app.yml
[colorful-chalk-logger options]: https://www.npmjs.com/package/colorful-chalk-logger#cli-options
[json-schema]: https://json-schema.org/
[json-schema-faker]: https://github.com/json-schema-faker/json-schema-faker
[typescript-json-schema schemaArgs]: https://github.com/lemon-clown/typescript-json-schema/blob/master/src/types.ts#L65
[typescript-json-schema]: https://github.com/lemon-clown/typescript-json-schema
