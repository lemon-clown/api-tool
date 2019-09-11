import fs from 'fs-extra'
import Ora from 'ora'
import chalk from 'chalk'
import webpack from 'webpack'
import paths from './config/paths'
import config from './config/webpack.config'
import formatWebpackMessages from './util/format-webpack-message'


// thanks https://github.com/qiqiboy/chrome-extension-development
async function build() {
  let timer: NodeJS.Timer
  const spinner = new (Ora as any)()
  const startTime = Date.now()

  const logProcess = (stop?: boolean) => {
    const message = `packing for production.... time used: ${Date.now() - startTime}ms.`
    if (stop) {
      clearTimeout(timer)
      spinner.succeed(chalk.green(message))
    } else {
      spinner.text = chalk.cyan(message)
      timer = setTimeout(logProcess, 100)
    }
  }

  // clear the target directory.
  console.log(chalk.yellow(`cleaning ${paths.appTarget}`))
  fs.emptyDirSync(paths.appTarget)
  console.log(chalk.green(`removed ${paths.appTarget}\n`))

  webpack(config).run(async (err: Error | null, stats: any) => {
    logProcess(true)

    if (err != null) {
      spinner.fail(chalk.red(' compilation fails.'))
      console.log(chalk.white(err.message || err.stack || ''))
      process.exit(-1)
    }

    const messages = formatWebpackMessages(stats.toJson({}))

    // if errors exists, only show errors.
    if (messages.errors.length > 0) {
      spinner.fail(chalk.red(' compilation fails.'))
      console.log()
      console.log(chalk.white(messages.errors.join('\n\n')))
      process.exit(-1)
    }

    // if warnings exists, show warnings if no errors were found.
    if (messages.warnings.length > 0) {
      spinner.warn(chalk.yellow(' compilation with warnings: '))
      console.log()
      console.log(messages.warnings.join('\n\n'))
      console.log()

      // teach some ESLint tricks.
      console.log(`search related ${ chalk.underline(chalk.yellow('keyword')) } to get more info about the warning.`)

      process.exit(-1)
    }

    spinner.succeed(chalk.green(`packaging complete. the target directory is: ${paths.appTarget}.`))
    console.log()
  })

  spinner.start()
  logProcess()
}

build()
