# Rollup Plugin Test Tools

This package supports [pack file](https://docs.npmjs.com/cli/v6/commands/npm-pack) testing for [dual module](https://nodejs.org/dist/latest-v14.x/docs/api/packages) packages.

Here are the basic steps:

* converts your units tests so that they use package instead of relative imports (e.g. `"../src/index.js"` to `"your-package"`)
  * [rollup-plugin-multi-input](https://github.com/alfredosalzillo/rollup-plugin-multi-input)
  * [rollup-plugin-relative-to-package](https://github.com/toolbuilder/rollup-plugin-relative-to-package)
* builds ES and CommonJS test projects around those tests
  * [rollup-plugin-create-test-package-json](https://github.com/toolbuilder/rollup-plugin-create-test-package-json)
  * [rollup-plugin-create-pack-file](https://github.com/toolbuilder/rollup-plugin-create-pack-file)
* and run the tests
  * [@toolbuilder/rollup-plugin-commands](https://github.com/toolbuilder/rollup-plugin-commands)

## Installation

```bash
npm install @toolbuilder/rollup-plugin-test-tools
```

## API

The re-exported packages are exported like this. Links to documentation for these packages are provided above.

```javascript
export { default as createTestPackageJson } from 'rollup-plugin-create-test-package-json'
export { default as multiInput } from 'rollup-plugin-multi-input'
export { default as relativeToPackage } from 'rollup-plugin-relative-to-package'
export { default as createPackFile } from '@toolbuilder/rollup-plugin-create-pack-file'
export { default as runCommands, shellCommand } from '@toolbuilder/rollup-plugin-commands'
```

## Configurations

The package exports two Rollup configurations. If they are suitable, do the following in your `rollup.config.js`:

```javascript
export { testConfigs as default } from '@toolbuilder/rollup-plugin-test-tools'
```

The `testConfigs` object is an `Array` with two configurations. The first configuration tests your package in a CommonJS project, and the second configuration tests your package in an ES project. Rollup will run one after the other.

These configurations expect the following:

* Unit tests are written using ES modules
* Unit tests produce TAP output and are standalone - I use [zora](https://www.npmjs.com/package/zora) becuase it also runs in the browser.
* Unit tests match this glob `test/**/*test.js`
* Source code matches this glob `src/**/*.js`
* The [pnpm](https://pnpm.io/) package manager is installed on your system

## Contributing

Contributions are welcome. Please create a pull request.

I use [pnpm](https://pnpm.js.org/) instead of npm, which is why you see `pnpm-lock.yaml` instead of npm lock files.

## Issues

This project uses Github issues.

## License

MIT
