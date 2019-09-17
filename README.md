# description

[![npm version](https://img.shields.io/npm/v/api-tool.svg)](https://www.npmjs.com/package/api-tool)

* 简单地来说，这个工具的作用是：ts 类型 --> JSON-SCHEMA --> mock-data --> mock-server
  - `ts 类型 --> JSON-SCHEMA`: 即把 ts 定义的类型转为 [json-schema][]，可见 [typescript-json-schema][]
  - `JSON-SCHEMA --> mock-data`: 即通过 `json-schema` 生成 mock 数据，可见 [json-schema-faker][]
  - `mock-data --> mock-server`: 即通过配置文件定义模型（json-schema/ts 类型）和 api 的关系，以生成 `mock-server`

# install

  ```shell
  npm install -g api-tool
  # or
  yarn global add api-tool
  ```

# usage

  * [demo/simple][]

  * [read more]


[demo/simple]: https://github.com/lemon-clown/api-tool/blob/master/demo/simple
[read more]: https://github.com/lemon-clown/api-tool/blob/master/doc


[json-schema]: https://json-schema.org/
[json-schema-faker]: https://github.com/json-schema-faker/json-schema-faker
[typescript-json-schema]: https://github.com/lemon-clown/typescript-json-schema

