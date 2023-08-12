import { format } from 'date-fns'
import { customAlphabet } from 'nanoid'
import { tmpdir } from 'os'
import { join } from 'path'

// make a unique number so that each Rollup run produces a different temporary directory
const nanoid = customAlphabet('1234567890abcdef', 10)

/**
 * Creates a unique temporary path.
 *
 * @param {String} prefix a prefix for the temporary path basename to help identify it during troubleshooting. Default is 'package-test'.
 * @returns a unique temporary path where the basename starts with prefix, and the alphabetic sort order is oldest to newest.
 * @example
 * const tempPath = tempPath('my-package')
 * console.log(tempPath) // prints something like <your os tmp dir>/my-package-2022-01-01T12:22-aXy23f
 */
export const tempPath = (prefix = 'package-test') => {
  // formatISO emits colons for the time part, which can be problematic on command lines as NPM parameters
  const timePart = format(Date.now(), "yyyy-MM-dd'T'kk-mm")
  return join(tmpdir(), `${prefix}-${timePart}-${nanoid()}`)
}
