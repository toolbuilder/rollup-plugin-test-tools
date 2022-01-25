import { tempPath } from '../src/temp-path.js'
import { RunPackfileTest } from './common.js'

const projectName = 'priority-buffer'
const testDir = tempPath('test-tools')
const rollupConfig = 'rollup.config.testjson.js'

const testRunner = new RunPackfileTest(testDir, projectName, 'v0.1.3', rollupConfig)
testRunner.run()
