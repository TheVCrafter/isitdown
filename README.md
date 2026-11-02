<p align="center">
  <img src="docs/images/logo.svg" alt="IsItDown? logo" width="160" />
</p>

# IsItDown?

[![CI](https://github.com/TheVCrafter/isitdown/actions/workflows/ci.yml/badge.svg)](https://github.com/TheVCrafter/isitdown/actions/workflows/ci.yml)

A website monitoring tool (downdetector) written in TypeScript. School project for module 324 (DevOps-Prozesse mit Tools unterstützen). The focus is the DevOps process around the app: requirements, source management, automated tests and delivery.

Live demo: <http://140.238.213.184:3000/>

## Status

Project setup, CI pipeline and branch protection are done. A command line tool checks whether websites are up or down. A monitor repeats the checks on a configurable interval, stores the results in SQLite, and serves a history page with the uptime and the results of each monitored URL. An automated integration test checks the whole chain. A release workflow publishes a versioned Docker image, deploys it to a Linux server, and checks that the application is healthy afterwards.

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

## Pre-commit hook

`npm install` installs a Git hook (Husky) that runs before every commit. It runs ESLint and Prettier on the staged TypeScript files and Prettier on the staged JSON, Markdown and YAML files, fixes what it can, and adds the fixes to the commit. A commit with an error that cannot be fixed is stopped.

To skip the hook in an emergency, use `git commit --no-verify`. The same checks run in the pipeline, so a skipped hook does not let badly formatted code reach `main`.

## Scripts

| Script                     | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `npm run lint`             | Lint with ESLint                                   |
| `npm run format`           | Format all files with Prettier                     |
| `npm run format:check`     | Check formatting without change                    |
| `npm run typecheck`        | Type check source and tests without emitting       |
| `npm run build`            | Compile `src/` to `dist/`                          |
| `npm run test`             | Run the unit tests once with Vitest                |
| `npm run test:integration` | Run the integration test (real storage and server) |
| `npm start`                | Run the compiled command line tool (after build)   |
| `npm run monitor`          | Run the monitor (after build)                      |

## Usage

```bash
npm run build
npm start -- https://example.com https://github.com
```

Each URL is validated and checked, and one line is printed per URL with its status, HTTP code and response time (or the error) and the time of the check.

## Monitoring

```bash
npm run build
npm run monitor -- https://example.com https://github.com
```

The monitor checks the URLs immediately and then repeatedly, stores every result in a SQLite database, and serves a history page at `http://localhost:3000`. Enter a monitored URL and a period to see its uptime and results. The same data is available as JSON at `/api/history?url=<url>&period=<1h|24h|7d>`. A health check is available at `/health`. Press Ctrl+C to stop it.

| Variable                 | Meaning                              | Default       |
| ------------------------ | ------------------------------------ | ------------- |
| `CHECK_INTERVAL_SECONDS` | Seconds between two rounds of checks | `300`         |
| `DATABASE_PATH`          | Path of the SQLite database file     | `isitdown.db` |
| `PORT`                   | Port of the history server           | `3000`        |

## Docker image

A release is created by pushing a version tag such as `v0.1.3`. The release workflow builds the image and publishes it to the GitHub container registry, tagged with the version and the commit.

```bash
docker run --rm -p 3000:3000 -v isitdown-data:/data ghcr.io/thevcrafter/isitdown:0.1.3 https://example.com
```

The URLs to monitor are passed as arguments. The database is stored in the volume `isitdown-data`, so the results survive restarts and new versions.

## Deployment

Pushing a version tag starts the release workflow. It publishes the image and then deploys exactly that version to a Linux server over SSH. A script on the server creates a swap file, installs Docker if needed, pulls the image and starts the container with a persistent data volume.

After the container starts, the workflow calls the `/health` endpoint from outside and fails the deployment if the application does not answer as healthy within about a minute.

The workflow needs these settings in the repository:

| Name                 | Type     | Meaning                                  |
| -------------------- | -------- | ---------------------------------------- |
| `DEPLOY_HOST`        | Secret   | Address of the server                    |
| `DEPLOY_USER`        | Secret   | Login user on the server                 |
| `DEPLOY_SSH_KEY`     | Secret   | Private key of the deployment key pair   |
| `DEPLOY_KNOWN_HOSTS` | Secret   | Host key of the server, to verify it     |
| `MONITOR_URLS`       | Variable | Websites to monitor, separated by spaces |

The server and the choice of hosting are described in [Hosting](docs/hosting.md).

## Project structure

```
src/                        application code
tests/                      unit tests (Vitest)
tests/integration/          integration test with a local target server
deploy/                     script that sets up and starts the app on the server
docs/                       decisions, evidence, hosting, requirements tools, TypeScript notes
docs/images/                screenshots and the project logo (logo.svg)
.github/workflows/          CI and release pipelines
.github/ISSUE_TEMPLATE/     user story and task templates
.husky/                     pre-commit hook
```

## Workflow

1. Create an issue (from the user story or task template) and move it to In Progress on the project board.
2. Create a branch from an up-to-date `main`, named `type/<issue>-short-name`.
3. Commit in small steps and reference the issue number.
4. Open a pull request using the template, with `Closes #<issue>`.
5. Squash merge once CI is green. The branch is deleted automatically and the issue moves to Done.

`main` is protected by a ruleset: changes need a pull request and a passing `build-and-test` check, and force pushes and deletions are blocked.

## CI

GitHub Actions runs two jobs on every pull request and on every push to `main`. `build-and-test` runs the format check, lint, typecheck, build and the unit tests. `integration-test` runs the integration test on its own.

A separate release workflow runs when a version tag is pushed. It publishes the Docker image, deploys it, and checks its health.

## Documentation

- [Decisions](docs/decisions.md)
- [Evidence per competency](docs/evidence.md)
- [Hosting](docs/hosting.md)
- [Requirements tools](docs/requirements-tools.md)
- [TypeScript notes](docs/typescript-notes.md)

## License

MIT, see [LICENSE](LICENSE).
