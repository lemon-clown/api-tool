import path from 'path'
import { ApiToolServeContext } from '@/core/serve/context'
import { ApiToolMockServer } from '@/core/serve'


async function debug() {
  const apiToolServeContext = new ApiToolServeContext({
    host: 'localhost',
    port: 8080,
    projectDir: path.resolve('demo/simple'),
    schemaRootPath: path.resolve('demo/simple/data/schemas'),
    apiItemConfigPath: path.resolve('demo/simple/api.yml'),
  })

  const server = new ApiToolMockServer(apiToolServeContext)
  server.start()
}


debug()
process.stdin.on('data', debug)
