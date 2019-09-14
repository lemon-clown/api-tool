import path from 'path'
import { ApiToolMockServer, ApiToolServeContext } from '@/core/serve'


async function debug() {
  const projectDir: string = path.resolve('demo/simple')
  const apiToolServeContext = new ApiToolServeContext({
    host: 'localhost',
    port: 8080,
    projectDir,
    schemaRootPath: path.join(projectDir, 'data/schemas'),
    apiItemConfigPath: path.join(projectDir, 'api.yml'),
  })

  const server = new ApiToolMockServer(apiToolServeContext)
  server.start()

  // 30s 后关闭服务器
  await new Promise(resolve => setTimeout(resolve, 30000))
  server.close()
}


debug()
process.stdin.on('data', debug)
