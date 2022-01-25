import shell from 'shelljs'

/**
 * Clone a project from Git that can use @toolbuilder/rollup-plugin-test-tools
 * Create the packfile for @toolbuilder/rollup-plugin-test-tools
 * Install the packfile in the cloned Git project
 * Sub-classes might further modify the project at this point by overriding setupProject
 * Copy a Rollup configuration to the cloned Git project
 * Run the Rollup configuration in the cloned Git project
 * That will test the pack file of the cloned Git project by creating other
 * test projects derived from the cloned project, and running their unit tests
 * agains the cloned Git project pack file. Whew!!!
 */
export class RunPackfileTest {
  constructor (testDir, projectName, projectVersion, rollupConfig) { // v0.1.3
    this.testDir = testDir
    this.projectName = projectName
    this.projectVersion = projectVersion
    this.projectDir = `${testDir}/${projectName}`
    this.rollupConfig = rollupConfig
  }

  run () {
    this.setupProject()
    this.test()
    shell.echo(`Test project is at: ${this.projectDir}`)
  }

  setupProject () {
    const checkForInstalledApp = (app) => {
      if (!shell.which(app)) {
        shell.echo(`Please install ${app}`)
        shell.exit(1)
      }
    }

    ;['git', 'pnpm'].forEach(app => checkForInstalledApp(app))

    const projectDir = `${this.testDir}/${this.projectName}`
    shell.mkdir('-p', this.testDir)

    shell.pushd(this.testDir)
    shell.exec(`git clone https://github.com/toolbuilder/${this.projectName}.git`)
    shell.cd(projectDir)
    shell.exec(`git checkout tags/${this.projectVersion}`) // get to a consistent state
    shell.exec('pnpm install')

    shell.popd()
    const packFileName = shell.exec('pnpm pack')
    shell.mv(packFileName, projectDir)

    shell.pushd(projectDir)
    shell.exec('pnpm remove @toolbuilder/rollup-plugin-test-tools')
    shell.exec(`pnpm add --save-dev file:${packFileName}`)
    shell.exec('pnpm run build:cjs')
    shell.popd()
  }

  test () {
    shell.cp(`testpack/${this.rollupConfig}`, this.projectDir)
    shell.pushd(this.projectDir)
    shell.exec(`pnpx rollup -c ${this.rollupConfig}`)
    shell.popd()
  }
}
