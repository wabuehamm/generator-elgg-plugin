'use strict'
const path = require('path')
const assert = require('yeoman-assert')
const helpers = require('yeoman-test')
const xml2js = require('xml2js')
const fs = require('fs')
const pluginLicenses = require('../generators/app/licenses')

const answers = {
    id: 'testplugin',
    name: 'Elgg Test Plugin',
    description: 'An Elgg Test Plugin',
    elggRelease: '3.0.0',
    category: 'uncategorized',
    author: 'testauthor',
    email: 'email@company.com',
    website: 'company.com',
    license: 'expat',
    repository: 'git@github.com:tester/tester-elgg-plugin.git',
    githubRelease: true,
    githubOwner: 'tester',
    githubRepository: 'tester-elgg-plugin',
    namespace: 'Tester\\TesterElggPlugin'
}

describe('generator-elgg-plugin:app', () => {
    beforeAll(() => {
        return helpers.run(path.join(__dirname, '../generators/app')).withPrompts(answers)
    })

    it('creates files', () => {
        assert.file([
            'package.json',
            'README.md',
            'composer.json',
            '.gitignore',
            'Gruntfile.js',
            'release.md',
            'manifest.xml',
            'elgg-plugin.php',
            'languages/en.php',
            'classes/Tester/TesterElggPlugin/Bootstrap.php'
        ])
    })

    it('creates a valid package.json', () => {
        assert.jsonFileContent('package.json', {
            name: answers.id,
            description: answers.description,
            homepage: answers.website,
            license: answers.license,
            author: {
                name: answers.author,
                email: answers.email
            },
            repository: {
                url: answers.repository,
                owner: answers.githubOwner,
                repo: answers.githubRepository
            },
            devDependencies: {
                'grunt-gh-release': '0.0.2'
            }
        })
    })
    it('creates a valid manifest file', () => {
        return fs.promises
            .readFile('manifest.xml')
            .then(content => {
                const parser = new xml2js.Parser()
                return parser.parseStringPromise(content)
            })
            .then(manifest => {
                assert.objectContent(manifest, {
                    // eslint-disable-next-line camelcase
                    plugin_manifest: {
                        name: [answers.name],
                        author: [answers.author],
                        id: [answers.id],
                        description: [answers.description],
                        website: [answers.website],
                        license: [pluginLicenses.find(license => license.value === answers.license).name],
                        category: [answers.category],
                        requires: [
                            {
                                version: [answers.elggRelease]
                            }
                        ]
                    }
                })
            })
    })
    it('Creates a valid Gruntfile', () => {
        assert.fileContent('Gruntfile.js', /gh_release: {/)
        assert.fileContent('Gruntfile.js', /'gh_release'/)
    })
    it('creates a valid README', () => {
        assert.fileContent('README.md', `# ${answers.name}`)
        assert.fileContent('README.md', answers.description)
        assert.fileContent('README.md', `* Elgg >= ${answers.elggRelease}`)
        assert.fileContent('README.md', 'grunt release')
    })
    it('creates a valid release.md', () => {
        assert.fileContent('release.md', `Elgg ${answers.elggRelease}`)
    })
    it('creates a valid elgg-plugin.php', () => {
        assert.fileContent('elgg-plugin.php', 'Tester\\TesterElggPlugin')
    })
    it('creates a valid Bootstrap', () => {
        assert.fileContent('classes/Tester/TesterElggPlugin/Bootstrap.php', 'namespace Tester\\TesterElggPlugin;')
    })
    it('creates a valid composer.json', () => {
        assert.jsonFileContent('composer.json', {
            name: `${answers.githubOwner}/${answers.id}`,
            description: answers.description,
            license: pluginLicenses.find(license => license.value === answers.license).name,
            support: {
                source: `https://github.com/${answers.githubOwner}/${answers.githubRepository}`,
                issues: `https://github.com/${answers.githubOwner}/${answers.githubRepository}/issues`
            },
            conflict: {
                'elgg/elgg': `<${answers.elggRelease}`
            }
        })
    })
})
