# Rollup Plugin Test Tools

[Rollup.js](https://www.rollupjs.org/) configurations to test your [pack file](https://docs.npmjs.com/cli/v6/commands/npm-pack) before publishing. It runs your unit tests against your packfile in an ES project, a CommonJS project, and in [Electron](https://www.electronjs.org/). This is primarily for [dual module](https://nodejs.org/api/packages.html#dual-commonjses-module-packages) packages.

There are also configurators that let you tweak the configurations a bit to meet your needs. If that's not good enough, this package re-exports a number of Rollup plugins for convenience.

Here are the basic steps and some of the plugins used:

* converts your units tests so that they use package instead of relative imports (e.g. `"../src/index.js"` to `"your-package-name"`)
  * [rollup-plugin-multi-input](https://github.com/alfredosalzillo/rollup-plugin-multi-input)
  * [rollup-plugin-relative-to-package](https://github.com/toolbuilder/rollup-plugin-relative-to-package)
* builds ES, CommonJS, and browser (runs in Electron) test projects around those tests
  * [rollup-plugin-create-test-package-json](https://github.com/toolbuilder/rollup-plugin-create-test-package-json)
  * [rollup-plugin-create-pack-file](https://github.com/toolbuilder/rollup-plugin-create-pack-file)
* and run the unit tests in the temporary test project
  * [@toolbuilder/rollup-plugin-commands](https://github.com/toolbuilder/rollup-plugin-commands)

The configurations have these requirements:

* Unit tests are written as ES modules.
* Since your pack file is being tested, the unit tests must use only package imports that are accessible when using the package.

The default configurations also expect this:

* Unit tests match this glob `test/**/*test.js`
* Source code matches this glob `src/**/*.js`
* Unit tests produce TAP output and are standalone - I use [zora](https://www.npmjs.com/package/zora) because it also runs in the browser.
* The [pnpm](https://pnpm.io/) package manager is installed globally on your system for the temporary projects to use.
* Rollup can produce a UMD file for your package, your tests, and all their dependencies.

## Install

```bash
npm install --save-dev @toolbuilder/rollup-plugin-test-tools
```

## Use

Just create a a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) like this:

```javascript
// Runs ES module test, CommonJS module test, then browser test in Electron
export { testConfigs as default } from '@toolbuilder/rollup-plugin-test-tools'
```

If you just want to run your tests in [Node](https://nodejs.org/) only, then your `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) could look like this:

```javascript
// Runs ES module test and CommonJS module test
export { nodeConfigs as default } from '@toolbuilder/rollup-plugin-test-tools'
```

If your tests are in the `testpack` directory instead of `tests`, then your `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) could look like this:

```javascript
import { baseTestConfig } from '@toolbuilder/rollup-plugin-test-tools'

const options = { testSourceDir: 'testpack' }
// Runs ES module test, CommonJS module test, then browser test in Electron
export default baseTestConfig(options)
```

If you need to convert your pack file tests to ES modules first, you can insert your rollup plugin to do that.

```javascript
import { baseTestConfig } from '@toolbuilder/rollup-plugin-test-tools'

const yourRollupConfiguration = { /* your configuration */ }
const options = { testSourceDir: 'testpack' }
// This project always returns an Array of Rollup configurations,
// so just use the spread operator to concatenate.
export default [yourRollupConfiguration, ...baseTestConfig(options)]

```

**NOTE** All configurations returned by this package are `Arrays` so that they can all be handled in a consistent manner. This is because some configurations require multiple configurations to perform the test.

## API

This package exports quite a few functions and configurations.

### Stock Rollup Configurations

Here are the export statments for the stock configurations. The methods `baseBrowserTestConfig` and `basePackFileTestConfig` are documented in the next section.

```javascript
// NOTE: Rollup plugins cannot always be reused!!! So each configuration is created separately.

// Test your pack file (after conversion to UMD) in Electron (e.g. browser environment)
export const browserTestConfig = baseBrowserTestConfig()
// Test your pack file in an ES (i.e. { "type": "module" }) Node project
export const nodeEsTestConfig = basePackfileTestConfig()
// Test your pack file in a CommonJS (i.e. { "type": "commonjs" }) Node project
export const nodeCommonJsTestConfig = basePackfileTestConfig({ format: 'cjs' })
// ES and CommonJS tests combined
export const nodeConfigs = [...basePackfileTestConfig(), ...basePackfileTestConfig({ format: 'cjs' })]
// ES, CommonJS, and Electron tests combined
export const baseTestConfig = (options = {}) => {
  return [
    ...basePackfileTestConfig({ format: 'cjs', ...options }),
    ...basePackfileTestConfig(options),
    ...baseBrowserTestConfig(options)
  ]
}
```

As noted above, the browser test builds a UMD file from your pack file **and your unit tests**. Most likely you will need a custom configuration.

### Configurators

Two configurable methods generate the tests.

* `basePackfileTestConfig(options = {})` **{Object[]}** - this method generates a Rollup configuration to test your pack file in a Node project. The option parameters are described in the next section.
* `baseBrowserTestConfig(options = {})` **{Object[]}** - this method generates a Rollup configuration to test your pack file in an Electron project. The option parameters are described in the next section.

### Configurator Options

The test configurations in the [testpack](./testpack) directory of this project provide some examples.

These options tell the plugin where to find the test files and your source:

* `testSourceDir` **{String}** - the directory where your pack file tests are. This is relative to your project structure. The default value is `test`.
* `input` **{String[]}** - Array of globs that specify what tests to use for packfile testing. The input globs are passed to [rollup-plugin-multiinput](https://github.com/alfredosalzillo/rollup-plugin-multi-input), and are processed by [micromatch](https://github.com/micromatch/micromatch). The default value is ```[`${testSourceDir}/**/*test.js`]```.
* `modulePaths` **{String}** - glob specify your source files. This is used to figure out  which test source imports to translate to package imports. The value is passed to [rollup-plugin-relative-to-package](https://github.com/toolbuilder/rollup-plugin-relative-to-package). By default the value is `src/**/*.js`.

These options tell the plugin where to put the temporary test project that tests your pack file.

* `packageId` **{String}**  - to help trouble shooting, prepend this value to the default temporary directory used for testing so it is easier to find. Default value is 'package-test'.
* `testPackageDir` **{String}** - specifies where the test project will be created. If this option is specified, the packageId option will be ignored. The default value is a unique directory in your OS temporary directory structure. The most recent testPackageDir will sort last.

These options tell the plugin how to configure the project that tests your pack file and run the tests:

* `format` **{String}** - Passed to Rollup to specfiy whether tests will be generated as 'es' or 'cjs'. This is only used by `basePackfileTestConfig`.
* `packCommand` **{String}** - Specify how to generate your pack file (e.g. 'npm pack' or 'pnpm pack'). The default value is `pnpm pack`.
* `testPackageJson` **{Object|Promise}** - partial package.json to provide test scripts and dependencies to the test project. It is passed to [@toolbuilder/rollup-plugin-create-test-package-json](https://github.com/toolbuilder/rollup-plugin-create-test-package-json).
* `checkSemverConflicts` **{boolean}** - check for semver conflicts between testPackageJson and your package.json. This value is passed to [@toolbuilder/rollup-plugin-create-test-package-json](https://github.com/toolbuilder/rollup-plugin-create-test-package-json). The default value in this package is `true`.
* `installCommands` **{function[]}** - Array of function commands to install test project dependencies. The commands are passed to [@toolbuilder/rollup-plugin-commands](https://github.com/toolbuilder/rollup-plugin-commands) to run. The default value is ```[shellCommand(`pnpm -C ${testPackageDir} install`)]```. BTW, `shellCommand` is exported by this package, and is from ['@toolbuilder/rollup-plugin-commands'](https://github.com/toolbuilder/rollup-plugin-commands).
* `testCommands` **{function[]}** - Array of commands to run test project tests. These are passed to the same plugin as the `installCommands`. The default value is ```[shellCommand(`pnpm -C ${testPackageDir} test`)]```. BTW, `shellCommand` is exported by this package, and is from ['@toolbuilder/rollup-plugin-commands'](https://github.com/toolbuilder/rollup-plugin-commands).

These options help tell the browser test how to build the UMD file that runs in Electron.

* `external` **{String[]}** - Rollup external dependencies, passed directly to Rollup. This option is only used by `baseBrowserTestConfig`.
* `globals` - **{Object}** - Rollup global names, passed directly to Rollup. This option is only used by `baseBrowserTestConfig`.

### TempPath

* `tempPath(prefix = 'package-test')` **{String}** - This function creates a unique temporary path name in your OS's temporary directory, but does not create the directory itself. The name includes a timestamp so the most recent one sorts last. The parameter `prefix` is prependended to the temporary name.

### Exported Dependencies

Some of this package's dependencies are exported for convenience. Links to documentation for these packages are provided above.

```javascript
// These are the export statements
export { default as alias } from '@rollup/plugin-alias'
export { default as multiEntry } from '@rollup/plugin-multi-entry'
export { default as resolve } from '@rollup/plugin-node-resolve'
export { default as runCommands, shellCommand } from '@toolbuilder/rollup-plugin-commands'
export { default as createPackFile } from '@toolbuilder/rollup-plugin-create-pack-file'
export { default as createTestPackageJson } from 'rollup-plugin-create-test-package-json'
export { default as multiInput } from 'rollup-plugin-multi-input'
export { default as relativeToPackage } from 'rollup-plugin-relative-to-package'
```

## Stability

This package will have a looser interpretation of [semver](https://semver.org/) numbering. For example adding [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) to the browser configuration does not affect my projects, but it might affect yours. So what I might think it is a small point change, might be a breaking change for you.

## Contributing

I hope you find this project useful enough to contribute. Please create an issue or a pull request.

* I use [pnpm](https://pnpm.js.org/) instead of npm.
* Package verification requires [pnpm](https://pnpm.io/) to be installed globally.
  * `npm install -g pnpm`
  * `pnpm install`
  * `pnpm run check:packfile` to test against Node ES and CommonJS projects, as well as Electron.
  * `pnpm run check` to validate the package is ready for commit

## Issues

This project uses Github issues.

## License

MIT
