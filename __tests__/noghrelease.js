'use strict'
const path = require('path')
const assert = require('yeoman-assert')
const helpers = require('yeoman-test')

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
    githubRelease: false,
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
            'Tester/TesterElggPlugin/Bootstrap.php'
        ])
    })

    it('creates a valid package.json', () => {
        assert.noJsonFileContent('package.json', {
            devDependencies: {
                'grunt-gh-release': '0.0.2'
            }
        })
    })
    it('Creates a valid Gruntfile', () => {
        assert.noFileContent('Gruntfile.js', /gh_release: {/)
        assert.noFileContent('Gruntfile.js', /'gh_release'/)
    })
    it('creates a valid README', () => {
        assert.noFileContent('README.md', 'grunt release')
    })
    it('creates a valid composer.json', () => {
        assert.noJsonFileContent('composer.json', {
            support: {}
        })
    })
})
