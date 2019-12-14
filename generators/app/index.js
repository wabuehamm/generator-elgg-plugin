'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')

const pluginCategories = require('./categories')
const pluginLicenses = require('./licenses')

module.exports = class extends Generator {
    prompting() {
        const capitalize = value => {
            return value.substring(0, 1).toUpperCase() + value.substring(1, value.length)
        }

        const descriptionPrefix = (value, required = false) => {
            return value.replace(/\n\s+/g, '\n') + `\n${chalk.green('?')}` + (required ? chalk.red('*') : '')
        }

        const required = value => {
            if (value && value !== '') {
                return true
            }

            return chalk.red('This value is required.')
        }

        this.log(yosay(`Welcome to the ${chalk.red('Elgg Plugin')} generator!`))

        this.log(`
            This generator will create a ${chalk.yellow('skeleton')} for a plugin for ${chalk.yellow('the Elgg platform')}. 
            Please answer the following questions (questions marked with ${chalk.red('*')} are required):
        `)

        const prompts = [
            {
                name: 'id',
                default: this.appname,
                prefix: descriptionPrefix(
                    `
                    Please enter the ID of your new plugin.
                    This will be the ${chalk.yellow('directory name')} inside the ${chalk.yellow('mod folder')} of your Elgg installation.
                    `,
                    true
                ),
                validate: required
            },
            {
                name: 'name',
                prefix: descriptionPrefix(
                    `
                    Please enter the name of your new plugin.
                    This will be shown in the ${chalk.yellow('plugins UI')}.
                    `,
                    true
                ),
                default: this.appname,
                validate: required
            },
            {
                name: 'description',
                prefix: descriptionPrefix('Please enter a general description for your plugin')
            },
            {
                name: 'elggRelease',
                prefix: descriptionPrefix(
                    `
                    Please enter the required Elgg release.
                    This will be used for the ${chalk.yellow('composer configuration')} and in the 
                    ${chalk.yellow("plugin's manifest file")}.
                    `,
                    true
                ),
                default: '3.0.0',
                validate: required
            },
            {
                name: 'category',
                prefix: descriptionPrefix(`
                    Please choose a category for your plugin.
                    Filtering for this will be available in the ${chalk.yellow('plugin UI')} and the 
                    ${chalk.yellow('Elgg plugin registry')}
                `),
                type: 'list',
                choices: pluginCategories,
                default: 17
            },
            {
                name: 'author',
                prefix: descriptionPrefix("Please enter the author's name", true),
                default: this.user.git.name(),
                validate: required
            },
            {
                name: 'email',
                prefix: descriptionPrefix("Please enter the author's email"),
                default: this.user.git.email()
            },
            {
                name: 'website',
                prefix: descriptionPrefix("Please enter the plugin's website")
            },
            {
                name: 'license',
                prefix: descriptionPrefix('Please select the license', true),
                type: 'list',
                choices: pluginLicenses,
                validate: required
            },
            {
                name: 'repository',
                prefix: descriptionPrefix('Please enter your git repository url')
            },
            {
                name: 'githubRelease',
                prefix: descriptionPrefix(`
                    Do you want to manage ${chalk.yellow('releases in GitHub')}?
                    You will need to enter a ${chalk.yellow('repository')} and its ${chalk.yellow('owner')} up next 
                    and you need to create a ${chalk.yellow('github access token')} here:
                    
                    ${chalk.yellow('https://github.com/settings/tokens')}
                    
                    Then you can create a new release like this:

                    ${chalk.yellow('GITHUB_TOKEN=<my token> grunt release:<new release number>')}
                `),
                type: 'confirm',
                default: true
            },
            {
                name: 'githubOwner',
                prefix: descriptionPrefix('What is the owner or organization of the github repository?', true),
                when: answers => answers.githubRelease,
                default: () => this.user.github.username() || 'FIXME',
                validate: required
            },
            {
                name: 'githubRepository',
                prefix: descriptionPrefix('What is the name of the github Repository?', true),
                when: answers => answers.githubRelease,
                validate: required
            },
            {
                name: 'namespace',
                prefix: descriptionPrefix(
                    `
                    This generator will create a bootstrap class for your plugin. Please specify a PHP namespace for that.
                    PHP namespaces are usually organized as ${chalk.yellow('<group>\\<application>(\\<subpath>)')}
                    `,
                    true
                ),
                default: answers => {
                    if (answers.githubRelease) {
                        return `${capitalize(answers.githubOwner)}\\${capitalize(answers.id)}`
                    }

                    return `MyName\\${capitalize(answers.id)}`
                },
                validate: required
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
            description: this.props.description,
            license: this.props.license,
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
            elggRelease: this.props.elggRelease,
            githubRelease: this.props.githubRelease
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

        this.fs.copyTpl(this.templatePath('Bootstrap.php.ejs'), this.destinationPath(`classes/${bootstrapPath}/Bootstrap.php`), {
            namespace: this.props.namespace
        })

        this.fs.copy(this.templatePath('.gitkeep'), this.destinationPath('views/.gitkeep'))
        this.fs.copy(this.templatePath('.gitkeep'), this.destinationPath('actions/.gitkeep'))
        this.fs.copy(this.templatePath('en.php'), this.destinationPath('languages/en.php'))
        this.fs.copy(this.templatePath('gitignorefile'), this.destinationPath('.gitignore'))
    }

    install() {
        this.installDependencies({ bower: false })
    }
}
