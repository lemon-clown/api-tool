import program from 'commander'
import { logger } from '@/util/logger'
import { loadGenerateCommand } from '@/core/generate'
import manifest from '../package.json'


program
  .version(manifest.version)

// load global options
logger.registerToCommander(program)

// load sub-commands
loadGenerateCommand(program)


program
  .parse(process.argv)
