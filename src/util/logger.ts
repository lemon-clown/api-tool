import { ColorfulChalkLogger } from 'colorful-chalk-logger'
import manifest from '../../package.json'


const loggerOptions = {
  colorful: true,
  inline: true,
  date: true,
}


export const logger: ColorfulChalkLogger = new ColorfulChalkLogger(manifest.name, loggerOptions, process.argv)
