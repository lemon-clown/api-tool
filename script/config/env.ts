import manifest from '../../package.json'
import tsconfig from '../../tsconfig.json'


export default {
  manifest,
  tsconfig,
  ...process.env,
}
