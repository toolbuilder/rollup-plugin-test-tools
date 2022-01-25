import { basePackfileTestConfig } from '@toolbuilder/rollup-plugin-test-tools'

// This test will use different unit test runners than the test tools implementation.
// We can do this because the unit tests are standalone and produce TAP output.

const cjsOptions = {
  format: 'cjs', // NOTE: Also testing format. Tape will not run ES modules without '-r esm'
  checkSemverConflicts: true, // check for semver range conflicts between testPackageJson and packageJson
  testPackageJson: {
    type: 'commonjs',
    scripts: { // 2: test script changed to concatenate the PouchDB distribution files for browser with the test UMD file
      test: 'tape "test/**/*test.js"'
    },
    devDependencies: {
      // dependencies for test script
      // esm: '^3.2.25',
      tape: '^5.4.1'
    }
  }
}

const esOptions = {
  // Testing default 'format' value which is ES. esm-tape-runner will not run cjs tests.
  checkSemverConflicts: true, // check for semver range conflicts between testPackageJson and packageJson
  testPackageJson: {
    type: 'module',
    scripts: { // 2: test script changed to concatenate the PouchDB distribution files for browser with the test UMD file
      test: 'esm-tape-runner "test/**/*test.js"'
    },
    devDependencies: {
      // dependencies for test script
      '@small-tech/esm-tape-runner': '^1.0.3'
    }
  }
}

// Changing testPackageJson will not work across configurations, need a different one per test type
// This means that the combined configurations cannot be tested
export default [
  // baseBrowserTestConfig was tested with a testPackageJson in alias.test.js
  ...basePackfileTestConfig(cjsOptions),
  ...basePackfileTestConfig(esOptions)
]
