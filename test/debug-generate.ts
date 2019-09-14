import path from 'path'
import { ApiToolGenerator, ApiToolGeneratorContext } from '@/core/generate'


let running = false
async function debug() {
  if (running) return
  running = true
  const projectDir: string = path.resolve('demo/simple')
  const apiToolGeneratorContext = new ApiToolGeneratorContext({
    tsconfigPath: path.join(projectDir, 'tsconfig.json'),
    schemaRootPath: path.join(projectDir, 'data/schemas'),
    apiItemConfigPath: path.join(projectDir, 'api.yml'),
    ignoreMissingModels: true,
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
