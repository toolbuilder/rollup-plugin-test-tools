import { nodeEsTestConfig, nodeCommonJsTestConfig, browserTestConfig, nodeConfigs, testConfigs } from '@toolbuilder/rollup-plugin-test-tools'

export default [
  ...nodeEsTestConfig,
  ...nodeCommonJsTestConfig,
  ...browserTestConfig,
  ...nodeConfigs,
  ...testConfigs
]
