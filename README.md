# IsItDown?

[![CI](https://github.com/TheVCrafter/isitdown/actions/workflows/ci.yml/badge.svg)](https://github.com/TheVCrafter/isitdown/actions/workflows/ci.yml)

A website monitoring tool (downdetector) written in TypeScript. School project for module 324 (DevOps-Prozesse mit Tools unterstützen). The focus is the DevOps process around the app: requirements, source management, automated tests and delivery.

## Status

Project setup, CI pipeline and branch protection are done. A command line tool checks whether websites are up or down, and a SQLite storage for check results exists but is not connected to the tool yet. History, uptime, the integration test, artifact publishing and deployment are not implemented yet.

## Requirements

- Node.js 24 or newer
- npm
- Git

## Setup

```bash
git clone https://github.com/TheVCrafter/isitdown.git
cd isitdown
npm install
```

## Scripts

| Script                 | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run lint`         | Lint with ESLint                                 |
| `npm run format`       | Format all files with Prettier                   |
| `npm run format:check` | Check formatting without change                  |
| `npm run typecheck`    | Type check source and tests without emitting     |
| `npm run build`        | Compile `src/` to `dist/`                        |
| `npm run test`         | Run the tests once with Vitest                   |
| `npm start`            | Run the compiled command line tool (after build) |

## Usage

```bash
npm run build
npm start -- https://example.com https://github.com
```

Each URL is validated and checked, and one line is printed per URL with its status, HTTP code and response time (or the error) and the time of the check.

## Project structure

```
src/                        application code
tests/                      tests (Vitest)
docs/                       decisions, evidence, TypeScript notes
.github/workflows/          CI pipeline
.github/ISSUE_TEMPLATE/     user story and task templates
```

## Workflow

1. Create an issue (from the user story or task template) and move it to In Progress on the project board.
2. Create a branch from an up-to-date `main`, named `type/<issue>-short-name`.
3. Commit in small steps and reference the issue number.
4. Open a pull request using the template, with `Closes #<issue>`.
5. Squash merge once CI is green. The branch is deleted automatically and the issue moves to Done.

`main` is protected by a ruleset: changes need a pull request and a passing `build-and-test` check, and force pushes and deletions are blocked.

## CI

GitHub Actions runs format check, lint, typecheck, build and tests on every pull request and on every push to `main`.

## Documentation

- [Decisions](docs/decisions.md)
- [Evidence per competency](docs/evidence.md)
- [TypeScript notes](docs/typescript-notes.md)

## License

MIT, see [LICENSE](LICENSE).
