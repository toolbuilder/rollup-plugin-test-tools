import createTestPackageJson from 'rollup-plugin-create-test-package-json'
import multiInput from 'rollup-plugin-multi-input'
import relativeToPackage from 'rollup-plugin-relative-to-package'
import createPackFile from '@toolbuilder/rollup-plugin-create-pack-file'
import runCommands, { shellCommand } from '@toolbuilder/rollup-plugin-commands'
import { tempPath } from './temp-path.js'
import resolve from '@rollup/plugin-node-resolve'
import multiEntry from '@rollup/plugin-multi-entry'
import { join } from 'path'

/*
  A sequence of Rollup configs that tests:

  * whether the package under test runs in the browser
  * whether the pack file supports for browser bundling
*/

const browserTempPath = tempPath('iterablefu-browser')

export const browserTestConfig = [
  // Convert unit tests that import '../src/package-entry.js' to import 'package-under-test'
  // NOTE: this means that the unit tests must use declared package entry points - your
  // package.exports declarations must provide access to the imports used by the unit tests.
  // Outputs multiple test files
  {
    input: ['test/**/*test.js'],
    output: {
      format: 'es',
      dir: join(browserTempPath, 'test')
    },
    plugins: [
      multiInput({ relative: 'test/' }),
      relativeToPackage({
        modulePaths: 'src/**/*.js'
      }),
      // relativeToPackage has identified the external packages,
      // which createTestPackageJson needs. The external packages
      // are not available in the following configs, so run now.
      createTestPackageJson({
        outputDir: browserTempPath,
        testPackageJson: {
          type: 'commonjs', // test package with commonJS module
          scripts: {
            test: 'cat all.umd.js | tape-run | tap-nirvana'
          },
          // Auto-magically adds external dependencies calculated
          // by relativeToPackage, so no need to list them.
          devDependencies: {
            // dependencies for test script
            'tape-run': '^9.0.0',
            'tap-nirvana': '^1.1.0'
          }
        }
      }),
      // Might as well create the packfile now, since we just built the
      // package.json and figured out the dependencies.
      createPackFile({
        outputDir: browserTempPath,
        packCommand: 'pnpm pack'
      }),
      // Install the external dependencies.
      runCommands({
        commands: [
          // Need to run this now, so the Rollup config that builds
          // the UMD file has them available to pull into the output.
          shellCommand(`pnpm -C ${browserTempPath} install`)
        ]
      })
    ]
  },
  // multiInput will not create a single output file, so use multiEntry for that.
  // Each test has a separate entry point, but multiEntry will combine them into
  // one test. Since the tests run automatically, they will run when all.js is
  // loaded.
  {
    input: [join(browserTempPath, 'test/**/*test.js')],
    // The external packages are unknown at this point, so will have to
    // put up with warnings, or figure them out dynamically
    output: {
      format: 'es',
      file: join(browserTempPath, 'test', 'all.js')
    },
    plugins: [
      multiEntry()
    ]
  },
  // multiEntry will not create UMD output, so another rollup config for that.
  // Create UMD file that runs all the unit tests, still with iterablefu external
  {
    input: join(browserTempPath, 'test', 'all.js'),
    output: {
      file: join(browserTempPath, 'all.umd.js'),
      format: 'umd',
      name: 'alltests'
    },
    plugins: [
      resolve(),
      runCommands({
        commands: [
          shellCommand(`pnpm -C ${browserTempPath} test`)
        ]
      })
    ]
  }
]
