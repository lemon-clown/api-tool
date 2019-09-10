import path from 'path'
import { ApiToolGenerator, ApiToolGeneratorContext } from '@/core/generate'


let running = false
async function debug() {
  if (running) return
  running = true
  const apiToolGeneratorContext = new ApiToolGeneratorContext({
    tsconfigPath: path.resolve('demo/simple/tsconfig.json'),
    schemaRootPath: path.resolve('demo/simple/data/schemas'),
    apiItemConfigPath: path.resolve('demo/simple/api.yml'),
    schemaArgs: {
      ref: false,
      required: true,
    }
  })

  const generator = new ApiToolGenerator(apiToolGeneratorContext)
  await generator.generate()
  running = false
}


debug()
process.stdin.on('data', debug)
