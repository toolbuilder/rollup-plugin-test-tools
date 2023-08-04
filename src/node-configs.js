import alias from '@rollup/plugin-alias'
import createTestPackageJson from 'rollup-plugin-create-test-package-json'
import multiInputPkg from 'rollup-plugin-multi-input'
import relativeToPackage from 'rollup-plugin-relative-to-package'
import createPackFile from '@toolbuilder/rollup-plugin-create-pack-file'
import runCommands, { shellCommand } from '@toolbuilder/rollup-plugin-commands'
import { tempPath } from './temp-path.js'

// multiInput is CJS module transpiled from TypeScript. Default is not coming in properly.
const isFunction = object => object && typeof (object) === 'function'
const multiInput = isFunction(multiInputPkg) ? multiInputPkg : multiInputPkg.default

/*
  Rollup configs to test a packfile with ES and CommonJS Node projects.
*/

/**
 * This represents the common parts between the ES and CommonJS test project generation. The userOptions
 * provide the differences.
 *
 * @param {Object} userOptions - Object that specifies variations on the basic configuration
 * @param {String} userOptions.format - the Rollup format option for the generated unit tests
 * @param {Object} userOptions.testPackageJson - the testPackageJson parameter for the rollup-plugin-create-test-package-json plugin.
 * This is a starter package.json for the generated test project.
 * @returns {RollupConfig} - A completed Rollup configuration object.
 */
export const basePackfileTestConfig = (userOptions = {}) => {
  const packageId = userOptions.packageId || 'package-test'
  const prefix = userOptions.format ? `${packageId}-${userOptions.format}` : `${packageId}-es`
  const testPackageDir = userOptions.testPackageDir || tempPath(prefix)
  const testSourceDir = userOptions.testSourceDir || 'test'
  const format = userOptions.format || 'es' // Rollup output format
  const options = {
    aliasOptions: {}, // file aliases for browser build
    installCommands: [shellCommand(`pnpm -C ${testPackageDir} install`)], // command to install dependencies
    testCommands: [shellCommand(`pnpm -C ${testPackageDir} test`)],
    input: [`${testSourceDir}/**/*test.js`], // unit test source file glob
    format,
    packCommand: 'pnpm pack', // command to generate pack file
    testPackageDir, // where the Node project for test will be located
    testPackageJson: {
      type: format === 'es' ? 'module' : 'commonjs',
      scripts: {
        test: `pta --reporter tap '${testSourceDir}/**/*test.js'`
      },
      devDependencies: {
        pta: '^1.2.0', // test runner does not against ES code using esm
        zora: '^5.2.0' // pta has zora as peer dependency
      }
    },
    checkSemverConflicts: true,
    ...userOptions
  }
  // Build a Rollup configuration object for pack file testing
  // Return an Array configuration so all configs produced by this package
  // can be handled consistently.
  return [{
    // process all unit tests, and specify output in 'test' directory of testPackageDir
    input: options.input,
    output: {
      format: options.format,
      dir: options.testPackageDir,
      preserveModules: true // Generate one unit test for each input unit test
    },
    plugins: [
      alias(options.aliasOptions),
      multiInput(), // Handles the input glob above
      relativeToPackage(), // default is to read package.json exports field
      createTestPackageJson({
        // Provide information that plugin can't pick up for itself
        checkSemverConflicts: options.checkSemverConflicts,
        testPackageJson: options.testPackageJson
      }),
      createPackFile({ // and move it to output.dir (i.e. testPackageDir)
        packCommand: options.packCommand
      }),
      runCommands({
        commands: [...options.installCommands, ...options.testCommands]
      })
    ]
  }]
}
