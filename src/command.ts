import program from 'commander'
import { GlobalOptions } from '@/types'
import { loadGenerateCommand } from '@/core/generate'
import { loadServeCommand } from '@/core/serve'
import { logger } from '@/util/logger'
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
}


const coverGlobalOption = (key: keyof GlobalOptions) => (t: any) => globalOptions[key] = { value: t, userSpecified: true }


program
  .version(manifest.version)
  .option('--encoding <encoding>', 'index encoding of all files.', 'utf-8')
  .on('option:cwd', coverGlobalOption('cwd'))
  .on('option:encoding', coverGlobalOption('encoding'))


// load global options
logger.registerToCommander(program)

// load sub-commands
loadGenerateCommand(program, globalOptions)
loadServeCommand(program, globalOptions)


program
  .parse(process.argv)
