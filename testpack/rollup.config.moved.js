import { baseBrowserTestConfig, basePackfileTestConfig, baseTestConfig } from '@toolbuilder/rollup-plugin-test-tools'

const testSourceDir = 'testpackfile'
export default [
  ...baseBrowserTestConfig({ testSourceDir }),
  ...basePackfileTestConfig({ testSourceDir }),
  ...baseTestConfig({ testSourceDir })
]
