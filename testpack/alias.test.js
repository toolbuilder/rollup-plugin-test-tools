import { tempPath } from '../src/temp-path.js'
import { RunPackfileTest } from './common.js'

const projectName = 'pouchdb-paginated-query'
const testDir = tempPath('test-tools')
const rollupConfig = 'rollup.config.alias.js'

const testRunner = new RunPackfileTest(testDir, projectName, 'v0.1.2', rollupConfig)
testRunner.run()
