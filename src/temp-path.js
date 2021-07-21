import cuid from 'cuid'
import { format } from 'date-fns'
import { tmpdir } from 'os'
import { join } from 'path'

export const tempPath = (prefix = 'package-test') => {
  // formatISO emits colons for the time part, which can be problematic on command lines as NPM parameters
  const timePart = format(Date.now(), "yyyy-MM-dd'T'kk-mm")
  return join(tmpdir(), `${prefix}-${timePart}-${cuid.slug()}`) // slug provides uniqueness in same minute
}
