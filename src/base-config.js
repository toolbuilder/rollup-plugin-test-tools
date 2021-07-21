import createTestPackageJson from 'rollup-plugin-create-test-package-json'
import multiInput from 'rollup-plugin-multi-input'
import relativeToPackage from 'rollup-plugin-relative-to-package'
import createPackFile from '@toolbuilder/rollup-plugin-create-pack-file'
import runCommands, { shellCommand } from '@toolbuilder/rollup-plugin-commands'
import { tempPath } from './temp-path.js'

/**
 * This represents the common parts between the ES and CommonJS test project generation. The userOptions
 * provide the differences.
 *
 * @param {Object} userOptions - Object that specifies variations on the basic configuration
 * @returns {RollupConfig} - A completed Rollup configuration object.
 */
export const basePackfileTestConfig = (userOptions) => {
  const testPackageDir = userOptions.testPackageDir || tempPath()
  const options = {
    commands: [
      // Install dependencies and run the unit test
      // The -C parameter ensures that the test does not resolve
      // any packages outside testPackageDir. Ordinarily, it
      // would pickup packages the package that called Rollup too
      // because the execution environments share paths.
      shellCommand(`pnpm -C ${testPackageDir} install-test`)
    ],
    input: ['test/**/*test.js'],
    format: 'es',
    modulePaths: 'src/**/*.js',
    packCommand: 'pnpm pack',
    testPackageDir,
    testPackageJson: {},
    ...userOptions
  }
  // Build a Rollup configuration object for pack file testing
  return {
    // process all unit tests, and specify output in 'test' directory of testPackageDir
    input: options.input,
    preserveModules: true, // Generate one unit test for each input unit test
    output: {
      format: options.format,
      dir: options.testPackageDir
    },
    plugins: [
      multiInput(), // Handles the input glob above
      relativeToPackage({ // This package converts relative imports to package imports
        modulePaths: options.modulePaths
      }),
      createTestPackageJson({
        // Provide information that plugin can't pick up for itself
        testPackageJson: options.testPackageJson
      }),
      createPackFile({ // and move it to output.dir (i.e. testPackageDir)
        packCommand: options.packCommand
      }),
      runCommands({
        commands: options.commands
      })
    ]
  }
}

export const testConfigs = [
  {
    format: 'cjs',
    testPackageJson: {
      type: 'commonjs', // test package with commonJS module
      scripts: {
        test: "tape 'test/*test.js' | tap-nirvana"
      },
      devDependencies: {
        // dependencies for test script
        tape: '^5.2.2',
        'tap-nirvana': '^1.1.0'
      }
    }
  },
  {
    format: 'es',
    testPackageJson: {
      type: 'module', // test package with ES module
      scripts: {
        test: "esm-tape-runner 'test/**test.js' | tap-nirvana"
      },
      devDependencies: {
        '@small-tech/esm-tape-runner': '^1.0.3',
        'tap-nirvana': '^1.1.0'
      }
    }
  }
].map(basePackfileTestConfig)
