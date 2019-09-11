import chalk from 'chalk'


const friendlySyntaxErrorLabel = 'Syntax error:'


interface WebpackMessage {
  errors: string[]
  warnings: string[]
}


/**
 * format error messages produced by webpack.
 * @param wm
 */
export default function formatWebpackMessages(wm: WebpackMessage) {
  const formattedErrors = wm.errors.map(message => formatMessage(message))
  const formattedWarnings = wm.warnings.map(message => formatMessage(message))
  const isLikelyAsSyntaxError = (message: string) => message.indexOf(friendlySyntaxErrorLabel) !== -1

  const result = {
    errors: formattedErrors,
    warnings: formattedWarnings,
  }

  /**
   * if there are any syntax errors, show just them.
   * this prevents a confusing ESLint parsing error
   *  preceding a much more useful Babel syntax error.
   */
  if (result.errors.some(isLikelyAsSyntaxError))
    result.errors = result.errors.filter(isLikelyAsSyntaxError)

  return result
}


function formatMessage(message: string) {
  let lines = message.split('\n')

  if (lines.length > 2 && lines[1] === '') {
    // remove extra newline
    lines.splice(1, 1)
  }

  /**
   * remove webpack-specific loader notation from filename
   * example:
   *    before: ./~/css-loader!./~/postcss-loader!./src/App.css
   *    after: ./src/App.css
   */
  if (lines[0].lastIndexOf('!') !== -1) {
    lines[0] = lines[0].substr(lines[0].lastIndexOf('!') + 1)
  }

  // remove unnecessary stack added by `thread-loader`
  const threadLoaderIndex = lines.findIndex(line => /thread.loader/i.test(line))
  if (threadLoaderIndex !== -1) lines = lines.slice(0, threadLoaderIndex)

  /**
   * webpack adds a list of entry points to warning messages:
   *    @ ./src/index.js
   *    @ multi react-scripts/~/react-dev-utils/webpackHotDevClient.js ...
   * it is misleading (and unrelated to the warnings) so we clean it up.
   * it is only useful for syntax errors but we have beautiful frames for them.
   */
  lines = lines.filter(line => line.indexOf(' @ ') !== 0)

  /**
   * line #0 is filename
   * line #1 is the main error message
   */
  if (!lines[0] || !lines[1]) return lines.join('\n')

  // cleans up verbose "module not found" messages for files and packages.
  if (lines[1].indexOf('Module not found: ') === 0) {
    lines = [
      lines[0],
      // Clean up message because "Module not found: " is descriptive enough.
      lines[1]
        .replace('Cannot resolve \'file\' or \'directory\' ', '')
        .replace('Cannot resolve module ', '')
        .replace('Error: ', '')
        .replace('[CaseSensitivePathsPlugin] ', ''),
    ]
  }

  // cleans up syntax error messages.
  if (lines[1].indexOf('Module build failed: ') === 0) {
    lines[1] = lines[1].replace(
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
  }

  // clean up export errors.
  const exportError = /\s*(.+?)\s*(")?export '(.+?)' was not found in '(.+?)'/
  if (lines[1].match(exportError)) {
    lines[1] = lines[1].replace(
      exportError,
      '$1 \'$4\' does not contain an export named \'$3\'.'
    )
  }

  lines[0] = chalk.inverse(lines[0])

  // reassemble the message.
  message = lines .join('\n')
  // remove internal stacks at ... ...:x:y
  message = message.replace(
    /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm,
    ''
  )

  return message.trim()
}
