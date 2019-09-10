import program from 'commander'
import { GlobalOptions } from '@/types'
import { loadGenerateCommand } from '@/core/generate'
import { logger } from '@/util/logger'
import manifest from '../package.json'


const globalOptions: GlobalOptions = {
  cwd: process.cwd(),
  encoding: 'utf-8',
}


program
  .version(manifest.version)
  .option('--encoding <encoding>', 'index encoding of all files.', 'utf-8')
  .on('option:encoding', encoding => globalOptions.encoding = encoding)

// load global options
logger.registerToCommander(program)

// load sub-commands
loadGenerateCommand(program, globalOptions)


program
  .parse(process.argv)
