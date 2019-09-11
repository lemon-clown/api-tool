import fs from 'fs-extra'
import path from 'path'
import env from './env'


const appDirectory = fs.realpathSync(process.cwd())
const resolvePath = (...relativePath: string[]) => path.resolve(appDirectory, ...relativePath)


const appRoot = appDirectory
const appSrc = resolvePath('src')
const appTarget = resolvePath(env.tsconfig.compilerOptions.outDir)


export default {
  appRoot,
  appSrc,
  appTarget,
  appMainName: 'index',
  appBinName: 'apit',
  appMainPath: resolvePath(appSrc, 'index.ts'),
  appBinPath: resolvePath(appSrc, 'command.ts'),
  appManifest: resolvePath('package.json'),
  appTsConfig: resolvePath('tsconfig.json'),
  appNodeModules: resolvePath('node_modules'),
  appExternals: getExternals(),
}


function getExternals() {
  return Object
    .getOwnPropertyNames(env.manifest.dependencies)
    .reduce((externals: any, key: string) => {
      externals[key] = `commonjs ${key}`
      return externals
    }, {})
}
