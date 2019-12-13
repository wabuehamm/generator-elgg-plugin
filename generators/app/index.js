'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')

const pluginCategories = [
    { name: 'Site admin', value: 'admin', short: 'admin' },
    { name: 'User admin', value: 'user', short: 'user' },
    {
        name: 'Authentication',
        value: 'authentication',
        short: 'authentication'
    },
    { name: 'Tools', value: 'tools', short: 'tools' },
    { name: 'Spam', value: 'spam', short: 'spam' },
    {
        name: 'Communication',
        value: 'communication',
        short: 'communication'
    },
    { name: 'Events', value: 'events', short: 'events' },
    { name: 'Media', value: 'media', short: 'media' },
    { name: 'Photos and Images', value: 'photos', short: 'photos' },
    {
        name: 'Third Party integrations',
        value: 'tpintegrations',
        short: 'tpintegrations'
    },
    { name: 'Clients', value: 'clients', short: 'clients' },
    { name: 'Widgets', value: 'widgets', short: 'widgets' },
    { name: 'Games', value: 'games', short: 'games' },
    { name: 'eCommerce', value: 'ecommerce', short: 'ecommerce' },
    { name: 'Language packs', value: 'languages', short: 'languages' },
    { name: 'Themes', value: 'themes', short: 'themes' },
    { name: 'Misc', value: 'misc', short: 'misc' },
    {
        name: 'Uncategorized',
        value: 'uncategorized',
        short: 'uncategorized'
    }
]

const pluginLicenses = [
    {
        name: 'GNU General Public License (GPL) version 2,',
        value: 'gpl2',
        short: 'gpl2'
    },
    {
        name: 'GNU Lesser General Public License (LGPL) version 2.1,',
        value: 'lgpl2.1',
        short: 'lgpl2.1'
    },
    {
        name: 'Berkeley Database License (aka the Sleepycat Software Product License),',
        value: 'berkeleydb',
        short: 'berkeleydb'
    },
    { name: 'Modified BSD license,', value: 'mbsd', short: 'mbsd' },
    { name: 'The Clear BSD License,', value: 'cbsd', short: 'cbsd' },
    { name: 'Expat (MIT) License,', value: 'expat', short: 'expat' },
    { name: 'FreeBSD license,', value: 'freebsd', short: 'freebsd' },
    { name: 'Intel Open Source License,', value: 'intel', short: 'intel' },
    { name: 'ISC (OpenBSD) License,', value: 'openbsd', short: 'openbsd' },
    {
        name: 'NCSA/University of Illinois Open Source License,',
        value: 'ncsa',
        short: 'ncsa'
    },
    { name: 'W3C Software Notice and License,', value: 'w3c', short: 'w3c' },
    { name: 'X11 License,', value: 'x11', short: 'x11' },
    {
        name: 'Zope Public License, versions 2.0 and 2.1,',
        value: 'zope',
        short: 'zope'
    }
]

module.exports = class extends Generator {
    prompting() {
        const capitalize = value => {
            return value.substring(0, 1).toUpperString + value.substring(1, value.length - 1)
        }

        this.log(yosay(`Welcome to the ${chalk.red('Elgg Plugin')} generator!`))

        const prompts = [
            {
                name: 'id',
                message: `Please enter the ID of your new plugin. It will be the ${chalk.yellow(
                    'directory name'
                )} inside the ${chalk.yellow('mod folder')} of your Elgg installation`,
                default: this.appname
            },
            {
                name: 'name',
                message: `Please enter the name of your new plugin. This will be shown in the ${chalk.yellow('plugins UI')}.`,
                default: this.appname
            },
            {
                name: 'description',
                message: 'Please enter a general description for your plugin'
            },
            {
                name: 'elggRelease',
                message: 'Please enter the required Elgg release',
                default: '3.0.0'
            },
            {
                name: 'category',
                message: 'Please choose a category for your plugin',
                type: 'list',
                choices: pluginCategories,
                default: 17
            },
            {
                name: 'author',
                message: "Please enter the author's name",
                default: this.user.git.name()
            },
            {
                name: 'email',
                message: "Please enter the author's email",
                default: this.user.git.email()
            },
            {
                name: 'website',
                message: "Please enter the plugin's website"
            },
            {
                name: 'license',
                message: 'Please select the license',
                type: 'list',
                choices: pluginLicenses
            },
            {
                name: 'repository',
                message: 'Please enter your git repository url'
            },
            {
                name: 'githubRelease',
                message: 'Do you want to manage releases in GitHub?',
                type: 'confirm',
                default: true
            },
            {
                name: 'githubOwner',
                message: 'What is the owner or organization of the github repository?',
                when: answers => answers.githubRelease,
                default: this.user.github.username() || 'FIXME'
            },
            {
                name: 'githubRepository',
                message: 'What is the name of the github Repository?',
                when: answers => answers.githubRelease
            },
            {
                name: 'namespace',
                message: 'This generator will create a bootstrap class for your plugin. Please specify a PHP namespace for that',
                default: answers => {
                    if (answers.githubRelease) {
                        return `${capitalize(answers.githubOwner)}/${capitalize(answers.id)}`
                    }

                    return `MyName\\${capitalize(answers.id)}`
                }
            }
        ]

        return this.prompt(prompts).then(props => {
            // To access props later use this.props.someAnswer;
            this.props = props
        })
    }

    writing() {
        let licenseName = pluginLicenses.find(license => license.value === this.props.license).name

        this.fs.copyTpl(this.templatePath('package.json.ejs'), this.destinationPath('package.json'), {
            name: this.props.id,
            license: licenseName,
            repository: this.props.repository,
            githubRelease: this.props.githubRelease,
            githubOwner: this.props.githubOwner,
            githubRepository: this.props.githubRepository,
            authorName: this.props.author,
            authorEmail: this.props.email,
            website: this.props.website
        })

        this.fs.copyTpl(this.templatePath('Gruntfile.js.ejs'), this.destinationPath('Gruntfile.js'), {
            githubRelease: this.props.githubRelease
        })

        this.fs.copyTpl(this.templatePath('manifest.xml.ejs'), this.destinationPath('manifest.xml'), {
            name: this.props.name,
            description: this.props.description,
            author: this.props.author,
            id: this.props.id,
            elggRelease: this.props.elggRelease,
            website: this.props.website,
            license: licenseName,
            category: this.props.category
        })

        this.fs.copyTpl(this.templatePath('README.md.ejs'), this.destinationPath('README.md'), {
            name: this.props.name,
            description: this.props.description,
            elggRelease: this.props.elggRelease
        })

        this.fs.copyTpl(this.templatePath('release.md.ejs'), this.destinationPath('release.md'), {
            elggRelease: this.props.elggRelease
        })

        this.fs.copyTpl(this.templatePath('composer.json.ejs'), this.destinationPath('composer.json'), {
            id: this.props.id,
            description: this.props.description,
            elggRelease: this.props.elggRelease,
            githubRelease: this.props.githubRelease,
            githubOwner: this.props.githubOwner,
            githubRepository: this.props.githubRepository,
            license: licenseName
        })

        this.fs.copyTpl(this.templatePath('elgg-plugin.php.ejs'), this.destinationPath('elgg-plugin.php'), {
            namespace: this.props.namespace
        })

        const bootstrapPath = this.props.namespace.replace(/\\/, '/')

        this.fs.copyTpl(this.templatePath('Bootstrap.php.ejs'), this.destinationPath(`${bootstrapPath}/Bootstrap.php`), {
            namespace: this.props.namespace
        })

        this.fs.copy(this.templatePath('.gitkeep'), this.destinationPath('views/.gitkeep'))
        this.fs.copy(this.templatePath('.gitkeep'), this.destinationPath('actions/.gitkeep'))
        this.fs.copy(this.templatePath('en.php'), this.destinationPath('languages/en.php'))
        this.fs.copy(this.templatePath('gitignorefile'), this.destinationPath('.gitignore'))
    }

    install() {
        this.installDependencies()
    }
}