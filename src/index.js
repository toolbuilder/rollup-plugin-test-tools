export { default as createTestPackageJson } from 'rollup-plugin-create-test-package-json'
export { default as multiInput } from 'rollup-plugin-multi-input'
export { default as relativeToPackage } from 'rollup-plugin-relative-to-package'
export { default as createPackFile } from '@toolbuilder/rollup-plugin-create-pack-file'
export { default as runCommands, shellCommand } from '@toolbuilder/rollup-plugin-commands'
export { tempPath } from './temp-path.js'
export { basePackfileTestConfig } from './node-configs.js'

import { browserTestConfig } from './browser-config.js'
import { nodeConfigs } from './node-configs.js'

export const testConfigs = [...nodeConfigs, ...browserTestConfig]
