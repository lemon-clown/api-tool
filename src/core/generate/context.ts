import path from 'path'
import ts from 'typescript'
import * as TJS from '@lemon-clown/typescript-json-schema'
import { ensureFilePathSync } from '@/util/fs-util'
import { ApiItem, loadApiItemConfig } from '../api-item'


/**
 * @member cwd                        执行命令所在的目录
 * @member tsconfigPath               tsconfig.json 所在的路径
 * @member modelDir                   待扫描的 ts 接口所在的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
 * @member schema                     生成的 Json-Schema 存放的文件夹（绝对路径或相对于 tsconfig.json 所在的路径）
 * @member apiItemConfigPath          定义 ApiItems 的文件路径（yaml 格式）
 * @member encoding                   目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）
 * @member additionalSchemaArgs       额外的构建 Schema 的选项
 * @member additionalCompilerOptions  额外的 CompilerOptions 选项
 */
export interface ApiToolGeneratorContextParams {
  tsconfigPath: string
  modelDir: string
  schemaDir: string
  apiItemConfigPath: string
  cwd?: string
  encoding?: string
  schemaArgs?: TJS.PartialArgs
  additionalCompilerOptions?: ts.CompilerOptions
}


/**
 * 生成器的上下文信息
 *
 * @member cwd        执行命令所在的目录
 * @member projectDir 待处理的目标工程路径（传进来的参数中，tsconfigPath 所在的目录）
 * @member modelDir   待扫描的 ts 接口所在的文件夹（绝对路径）
 * @member schemaDir  生成的 Json-Schema 存放的文件夹（绝对路径）
 * @member apiItems   ApiItem 列表，描述
 * @member encoding   目标工程的文件编码（简单起见，只考虑所有的源码使用同一种编码格式）；默认值为 utf-8
 * @member program    ts.Program: A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions' that represent a compilation unit.
 * @member generator  Json-Schema 生成器
 */
export class ApiToolGeneratorContext {
  public readonly cwd: string
  public readonly projectDir: string
  public readonly modelDir: string
  public readonly schemaDir: string
  public readonly apiItems: ApiItem[]
  public readonly encoding: string
  public readonly program: ts.Program
  public readonly generator: TJS.JsonSchemaGenerator

  public constructor (params: ApiToolGeneratorContextParams) {
    const {
      cwd = process.cwd(),
      encoding = 'utf-8',
      modelDir,
      schemaDir,
      apiItemConfigPath,
      tsconfigPath,
      schemaArgs,
      additionalCompilerOptions
    } = params

    // ensure tsconfigPath is valid.
    ensureFilePathSync(tsconfigPath)

    this.cwd = cwd
    this.encoding = encoding
    this.projectDir = path.resolve(this.cwd, path.dirname(tsconfigPath))
    this.modelDir = path.resolve(this.projectDir, modelDir)
    this.schemaDir = path.resolve(this.projectDir, schemaDir)
    this.apiItems = loadApiItemConfig(apiItemConfigPath, encoding)
    this.program = this.buildProgram(tsconfigPath, additionalCompilerOptions)
    this.generator = TJS.buildGenerator(this.program, schemaArgs)!

    if (this.generator == null) {
      throw new Error('failed to build jsonSchemaGenerator.')
    }
  }

  /**
   * create ts program instance
   * @param params
   */
  private buildProgram (tsconfigPath: string, additionalCompilerOptions: ts.CompilerOptions = {}) {
    const result = ts.parseConfigFileTextToJson(tsconfigPath, ts.sys.readFile(tsconfigPath)!)
    const configObject = result.config
    const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(tsconfigPath), additionalCompilerOptions, path.basename(tsconfigPath))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { out, outDir, outFile, declaration, declarationDir, declarationMap, ...restOptions } = configParseResult.options
    restOptions.noEmit = true

    const program = ts.createProgram({
      rootNames: configParseResult.fileNames,
      options: restOptions,
      projectReferences: configParseResult.projectReferences
    })
    return program
  }
}
