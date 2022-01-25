import { tempPath } from '../src/temp-path.js'
import { RunPackfileTest } from './common.js'
import shell from 'shelljs'

const projectName = 'priority-buffer'
const testDir = tempPath('test-tools')
const rollupConfig = 'rollup.config.moved.js'

class TestRunner extends RunPackfileTest {
  setupProject () {
    super.setupProject()
    shell.pushd(this.projectDir)
    shell.mv('test', 'testpackfile') // move all the unit tests to match configuration
    shell.popd()
  }
}

const testRunner = new TestRunner(testDir, projectName, 'v0.1.3', rollupConfig)
testRunner.run()
