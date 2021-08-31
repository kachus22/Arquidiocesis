# APP de Arquidiocesis de Monterrey
 *Ningún adulto mayor debe estar solo ni perder la esperanza.*

## Table of contents

- [Client Details](#client-details)
- [Environment URLS](#environment-urls)
- [Team](#team)
- [Technology Stack](#technology-stack)
- [Management Tools](#management-tools)
- [Setup the project](#setup-the-project)
- [Running the stack for development](#running-the-stack-for-development)

### Client Details

| Name         | Email                   | Role |
| ------------ | ----------------------- | ---- |
| Hector Ayala | ayalahector@hotmail.com | CEO  |

### Environment URLS

- **Production** - https://arquidiocesis.netlify.app/
- **Development** - N/A

### Team

| Name              | Email              | Role                               |
| ----------------- | ------------------ | ---------------------------------- |
| Enrique García    | A00818997@itesm.mx | Product Owner Proxy                |
| Genaro Martínez   | A01566055@itesm.mx | Tech Lead                          |
| Melba Consuelos   | A01410921@itesm.mx | SCRUM Master                       |
| Tanya González    | A00823408@itesm.mx | Technical Writer                   |
| César Barraza     | A01176786@itesm.mx | Administración de la configuración |
| Daniel Gaytán     | A00819362@itesm.mx | Development                        |
| Patricio Saldivar | A10282504@itesm.mx | Development                        |
| Martín Rivas      | A00818919@itesm.mx | Development                        |
| Roberto Treviño   | A01282035@itesm.mx | Development                        |
| Diego Martínez    | A01176489@itesm.mx | Development                        |
| Fernando López    | A01172527@itesm.mx | Development                        |
| Carlos Tamez      | A00817514@itesm.mx | Development                        |
| Andrés Sánchez    | A00819118@itesm.mx | Development                        |
| Carlos Miranda    | A00817390@itesm.mx | Development                        |
| Gerardo Suarez    | A00817505@itesm.mx | Development                        |
| Rolando Mata      | A00816442@itesm.mx | Development                        |

### Technology Stack

| Technology   | Version  |
| ------------ | -------- |
| Expo         | 36.00.00 |
| ReactJS      | 16.9.0   |
| React Native | 00.61.04 |

### Management tools

You should ask for access to this tools if you don't have it already:

- [Github repo](https://github.com/)
- [Backlog](https://asana.com)
- [Netlify](https://netlify.com/)
- Documentation (Microsoft Teams)

## Development

### Setup the project

Make sure the following tools are installed in your system:

- [Node v12.X.X](https://nodejs.org/en/download/)
- [Yarn v1.21.X](https://yarnpkg.com/en/docs/install)
- [Git v2.X.X](https://git-scm.com/downloads)

1. Clone this repository into your local machine

```bash
$ git clone git@github.com:ProyectoIntegrador2018/arquidiocesis-app.git
$ cd arquidiocesis-app
```

2. Install the project dependencies

```bash
$ yarn install
```

### Running the stack for Development

1. Open a terminal and run

```
$ yarn run web
```

A web page will open and show the application running.

If you want to try the mobile version run

```
$ yarn run start
```

That command will open the Expo development server.

Once you are presented with a QR code, open up a mobile simulator either:

1. Using the presented options in the expo development server page
2. Using the Expo App on your phone and scanning the QR code.

### Stop the project

To stop the application run control + C or command + C (mac) in the terminal.

### Run unit and integration tests

In terminal or CLI run the following command:

```
$ yarn test
```

The command will do the following:

1. Present all unit and integration tests for components that are alive in the system.
2. Each unit test will appear with debug information and a green checkmark if it passed
3. Each component has a bunch of unit test and one integration test, the latest will be executed at the end.

## Version control

### Conventional commits

Commit messages are an essential part of software development because they allow us to communicate why our code changed.

To enforce a good convention is followed we're using [Commitizen](https://github.com/commitizen/cz-cli) and [Commitlint](https://github.com/conventional-changelog/commitlint).

Commitizen is a command line utility that will prompt you to fill in any required fields (run with `yarn commit`) and your commit messages will be formatted according to the standards defined by project maintainers. In our case, we're using the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) standard with the following structure:

```
type(scope): subject
```

Commitlint is a linter for our commit messages and checks if they meet the [conventional commit format](https://www.conventionalcommits.org).

Commitizen and commitlint will enforce we're creating conventional commit messages and, with the help of [husky](https://github.com/typicode/husky), they will prevent us from committing changes without the proper message structure.

### Semantic release

One of the advantages of using the conventional commit format is that dovetails with [SemVer](https://semver.org), by describing the features, fixes, and breaking changes made in commit messages.

[Semantic release](https://github.com/semantic-release/semantic-release) uses the commit messages to determine the type of changes in the codebase and automatically determines the next semantic version number, updates our version property in `package.json`, generates a changelog, commits the change and publishes the release to GitHub (both the commit and the release tag).

### GitHub templates and workflows

To ensure a standard when creating Pull Requests or Issues (bug or feature request) we've included some templates inside the `.github` folder.

To automate the release of new versions we're using GitHub Actions to run the following workflows:

- **Verify pull request base branch:** Run when a pull request to the `master` branch is open. It will verify the base branch is `dev` and will fail if not the case.
- **Set release version:** Run when changes are pushed to `master`. It will run `semantic-release` and sync the `master` branch with `dev`. To enable this workflow in your repository add the `GH_TOKEN` secret based on a personal access token with repo scope.

To disable a given workflow simply remove the file.
