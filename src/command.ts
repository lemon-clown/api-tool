import program from 'commander'
import { GlobalOptions } from '@/types'
import { loadGenerateCommand } from '@/core/generate'
import { loadServeCommand } from '@/core/serve'
import { updateLogLevel } from '@/util/logger'
import manifest from '../package.json'


const globalOptions: GlobalOptions = {
  cwd: {
    value: process.cwd(),
    userSpecified: false,
  },
  encoding: {
    value: 'utf-8',
    userSpecified: false,
  },
  configPath: {
    value: 'app.yml',
    userSpecified: false,
  },
  logLevel: {
    value: 'info',
    userSpecified: false,
  },
}


const coverGlobalOption = (key: keyof GlobalOptions) => (t: any) => globalOptions[key] = { value: t, userSpecified: true }


program
  .version(manifest.version)
  .option('-c, --config-path <config-path>', 'specify config file (absolute or relative to the projectDir) to create context params (lower priority)', 'app.yml')
  .option('--encoding <encoding>', 'index encoding of all files.', 'utf-8')
  .option('--log-level <level>', 'specify logger\'s level.')
  .on('option:cwd', coverGlobalOption('cwd'))
  .on('option:encoding', coverGlobalOption('encoding'))
  .on('option:config-path', coverGlobalOption('configPath'))
  .on('option:log-level', (t: string) => {
    coverGlobalOption('logLevel')(t)
    updateLogLevel(t)
  })


// load sub-commands
loadGenerateCommand(program, globalOptions)
loadServeCommand(program, globalOptions)


program
  .parse(process.argv)
