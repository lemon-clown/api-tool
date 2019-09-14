import { ColorfulChalkLogger, Level } from 'colorful-chalk-logger'
import manifest from '../../package.json'


const loggerOptions = {
  colorful: true,
  inline: true,
  date: true,
}


export const logger: ColorfulChalkLogger = new ColorfulChalkLogger(manifest.name, loggerOptions, process.argv)


/**
 * 更新日志打印级别
 * @param levelName
 */
export function updateLogLevel (levelName: string) {
  const level = Level.valueOf(levelName)
  if (level == null) return
  logger.setLevel(level)
}
