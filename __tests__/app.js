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
            'Tester/TesterElggPlugin/Bootstrap.php'
        ])
    })

    it('creates a valid package.json', () => {
        assert.jsonFileContent('package.json', {
            name: answers.name,
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
})
