import alias from '@rollup/plugin-alias'
import createTestPackageJson from 'rollup-plugin-create-test-package-json'
import multiInputPkg from 'rollup-plugin-multi-input'
import relativeToPackage from 'rollup-plugin-relative-to-package'
import createPackFile from '@toolbuilder/rollup-plugin-create-pack-file'
import runCommands, { shellCommand } from '@toolbuilder/rollup-plugin-commands'
import { tempPath } from './temp-path.js'
import resolve from '@rollup/plugin-node-resolve'
import multiEntry from '@rollup/plugin-multi-entry'
import { join } from 'path'

// multiInput is CJS module transpiled from TypeScript. Default is not coming in properly.
const isFunction = object => object && typeof (object) === 'function'
const multiInput = isFunction(multiInputPkg) ? multiInputPkg : multiInputPkg.default

/**
 * Test a pack file in Electron.
 *
 * @param {Object} userOptions - options to overwrite default configuration options.
 * @returns {Array} - a series of Rollup configurations to be run one after the other.
 */
export const baseBrowserTestConfig = (userOptions = {}) => {
  const packageId = userOptions.packageId || 'package-test'
  const prefix = `${packageId}-browser`
  const testPackageDir = userOptions.testPackageDir || tempPath(prefix)
  const testSourceDir = userOptions.testSourceDir || 'test'
  const options = {
    input: [`${testSourceDir}/**/*test.js`], // unit test source file glob
    aliasOptions: {}, // file aliases for browser build
    external: [], // external packages in final UMD rollup
    globals: {}, // global variables in final UMD rollup
    packCommand: 'pnpm pack', // command to generate pack file
    installCommands: [shellCommand(`pnpm -C ${testPackageDir} install`)], // command to install dependencies
    testCommands: [shellCommand(`pnpm -C ${testPackageDir} test`)],
    testPackageDir, // where the Node project for test will be located
    checkSemverConflicts: true, // check for semver range conflicts between testPackageJson and packageJson
    // testPackageJson overrides createTestPackageJson output. It also supplies
    // data that it can't figure out itself. This is where test scripts and test
    // dependencies need to be added.
    testPackageJson: {
      type: 'commonjs', // test package with commonJS module
      scripts: {
        // This is the script that actually runs the tests in Electron.
        test: 'cat all.umd.js | tape-run'
      },
      devDependencies: {
      // dependencies for test script
        'cash-cat': '^0.2.0', // provides 'cat' for non-POSIX shells
        'tape-run': '^10.0.0' // runs UMD tests that output TAP in Electron
      }
    },
    ...userOptions
  }
  /*
    Testing in three parts...

    Step 1: Convert unit tests that import '../src/index.js' to import 'package-under-test'
    NOTE: this means that the unit tests must use declared package entry points - your
    package.exports declarations must provide access to the imports used by the unit tests.
    MultiInput can handle multiple input files, but cannot create a single output file.

    Step 2: Use MultiEntry to create a single ES file from the files in Step 1. Since the
    tests are all standalone, they will run one after the other in the single file.
    MultiEntry will not create UMD output, so we need another configuration to do that.

    Step 3: Create a UMD file from the single file generated in Step 2, and run the tests.

  */
  return [
    /*
      Step 1.

      After this step runs, the test project is completely built with
      a package.json, and the dependencies are installed.

      The tests are already in place, but they need to be converted to
      UMD packages to run in Electron. That's steps 2 and 3.
    */
    {
      input: options.input,
      output: {
        format: 'es',
        dir: join(testPackageDir, testSourceDir)
      },
      plugins: [
        // support file substitution for browser
        alias(options.aliasOptions),
        multiInput({ relative: `${testSourceDir}/` }),
        relativeToPackage(),
        // relativeToPackage has identified the external packages,
        // which createTestPackageJson needs. The external packages
        // are not available in the following configs, so run now.
        createTestPackageJson({
          checkSemverConflicts: options.checkSemverConflicts,
          outputDir: testPackageDir,
          testPackageJson: options.testPackageJson
        }),
        // Might as well create the packfile now, since we just built the
        // package.json and figured out the dependencies.
        createPackFile({
          outputDir: testPackageDir,
          packCommand: options.packCommand
        }),
        // Install the external dependencies.
        // Need to run this now, so the Rollup config that builds
        // the UMD file has them available to pull into the output.
        runCommands({
          commands: options.installCommands
        })
      ]
    },
    /*
      Step 2.

      In the previous step, relativeToPackage figured out the external packages.
      However, in this configuration, that information is unknown. So there
      will be a bunch of warnings about external packages.
    */
    {
      // Since we're running from the context of the package being tested,
      // but using files in the test project, need to adjust the input globs.
      input: options.input.map(inputGlob => join(testPackageDir, inputGlob)),
      output: {
        format: 'es',
        file: join(testPackageDir, testSourceDir, 'all.js')
      },
      plugins: [
        multiEntry()
      ]
    },
    /*
      Step 3.

      Use external and globals when you want to provide pre-built packages
      directly to the test.

      This step actually runs the unit tests with the runCommands plugin.
    */
    {
      input: join(testPackageDir, testSourceDir, 'all.js'),
      external: options.external,
      output: {
        globals: options.globals,
        file: join(testPackageDir, 'all.umd.js'),
        format: 'umd',
        name: 'alltests'
      },
      plugins: [
        resolve(),
        runCommands({
          commands: options.testCommands
        })
      ]
    }
  ]
}
