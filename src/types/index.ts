/**
 * @member value          参数的值
 * @member userSpecified  是否是用户指定的
 */
interface OptionItem<T> {
  value: T
  userSpecified: boolean
}


/**
 * 全局参数
 *
 * @member cwd      执行命令时所在的目录
 * @member encoding 文件编码格式（简单起见，不支持多种编码）
 */
export interface GlobalOptions {
  cwd: OptionItem<string>
  encoding: OptionItem<string>
  configPath: OptionItem<string>
  logLevel: OptionItem<string>
}
