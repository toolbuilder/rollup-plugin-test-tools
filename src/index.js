// export { default as alias } from '@rollup/plugin-alias'
// export { default as multiEntry } from '@rollup/plugin-multi-entry'
// export { default as resolve } from '@rollup/plugin-node-resolve'
// export { default as runCommands, shellCommand } from '@toolbuilder/rollup-plugin-commands'
// export { default as createPackFile } from '@toolbuilder/rollup-plugin-create-pack-file'
// export { default as createTestPackageJson } from 'rollup-plugin-create-test-package-json'
// export { default as multiInput } from 'rollup-plugin-multi-input'
// export { default as relativeToPackage } from 'rollup-plugin-relative-to-package'
export { baseBrowserTestConfig } from './browser-config.js'
export { basePackfileTestConfig } from './node-configs.js'
export { tempPath } from './temp-path.js'

import { baseBrowserTestConfig } from './browser-config.js'
import { basePackfileTestConfig } from './node-configs.js'
export const baseTestConfig = (options = {}) => {
  return [
    ...basePackfileTestConfig({ format: 'cjs', ...options }),
    ...basePackfileTestConfig(options),
    ...baseBrowserTestConfig(options)
  ]
}

// NOTE: Rollup configs cannot be reused!!!
// Electron (e.g. browser environment)
export const browserTestConfig = baseBrowserTestConfig()
// ES (i.e. { "type": "module" }) project
export const nodeEsTestConfig = basePackfileTestConfig()
// CommonJS (i.e. { "type": "commonjs" }) project
export const nodeCommonJsTestConfig = basePackfileTestConfig({ format: 'cjs' })
// ES and CommonJS
export const nodeConfigs = [...basePackfileTestConfig(), ...basePackfileTestConfig({ format: 'cjs' })]
// ES, CommonJS, and Electron
export const testConfigs = [
  ...basePackfileTestConfig(),
  ...basePackfileTestConfig({ format: 'cjs' }),
  ...baseBrowserTestConfig()
]
