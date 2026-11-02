# Evidence

Evidence per competency band. Each section lists what exists, where to find it, and what is still open.

## A1: Requirements

**Done**

- Requirements are managed on a GitHub Project board (`IsItDown?`), linked to the repository.
- Statuses: Backlog, Todo, In Progress, In Review, Done. The board workflows add new issues to Backlog and move them to Done when an issue is closed or its pull request is merged.
- Issue templates for user stories and tasks, plus six labels (`user-story`, `feature`, `ci`, `docs`, `chore`, `bug`).
- Three user stories with acceptance criteria: [#7](https://github.com/TheVCrafter/isitdown/issues/7) (check whether a website is up or down), [#8](https://github.com/TheVCrafter/isitdown/issues/8) (history and uptime) and [#9](https://github.com/TheVCrafter/isitdown/issues/9) (automated testing, build and deployment). Each story is broken into five sub-issues (#10 to #14, #15 to #19 and #20 to #24), so its progress is visible on the story. Three more issues (#25 to #27) cover the requirements tool comparison, the development environment extension and the final documentation.
- All three stories are finished: their sub-issues were closed by pull requests (#13 was closed with a comment that links to the tests that cover it), and each story was closed with a comment that maps its acceptance criteria to the issues and code that cover them.
- Each story has a milestone that groups the story and its five sub-issues: "Story #7: Check whether a website is up or down", "Story #8: History and uptime" and "Story #9: Test, build and deploy". The issues #25 to #27 belong to the milestone "Documentation and tooling". The finished milestones are closed.
- Traceability example: issue [#2](https://github.com/TheVCrafter/isitdown/issues/2) (CI workflow) → branch `ci/2-add-workflow` → pull request [#3](https://github.com/TheVCrafter/isitdown/pull/3) with `Closes #2` → merged → issue closed and moved to Done automatically.

![Project board with issues #1 and #2 in the Done column](images/a1-board-overview.png)

![Issue #2 closed by pull request #3, with the project status Done and the timeline of board automation](images/a1-issue-closed-by-pr.png)

![Repository labels with descriptions](images/a1-labels.png)

![Board column Done with the stories #7, #8 and #9, each with five of five sub-issues closed](images/a1-board-stories.png)

- Comparison of requirements management tools: GitHub Projects, Jira and Trello are compared on the link to the code, the structure of requirements, automation, visibility, and cost and setup. The recommendation is GitHub Projects, because the requirements and the code are in the same system. The comparison is in [requirements tools](requirements-tools.md), with the date the plan limits were checked and its sources.

**Open**

- None.

## B1: Development environment

**Done**

- Node.js, TypeScript (strict), ESLint, Prettier, Vitest and npm scripts for `lint`, `format`, `format:check`, `typecheck`, `build`, `test` and `test:integration`.
- Editor and line ending setup: `.editorconfig`, `.gitattributes`, `.prettierrc` and shared VS Code settings in `.vscode/settings.json`.
- Two TypeScript configs: `tsconfig.json` covers `src` and `tests` for the editor and `typecheck`; `tsconfig.build.json` builds only `src`.
- Two Vitest configs: `vitest.config.ts` runs the unit tests, and `vitest.integration.config.ts` runs only the integration test.
- Setup steps for a fresh clone are in the [README](../README.md#setup); the reasons for the choices are in [decisions](decisions.md) and [TypeScript notes](typescript-notes.md).
- Setup commit: [`56daa85`](https://github.com/TheVCrafter/isitdown/commit/56daa85).
- Extension of the development environment: a pre-commit hook (Husky and lint-staged) runs ESLint and Prettier on the staged files before every commit and adds the fixes to the commit. It is installed automatically by `npm install`. The reasons and the details are in [decisions](decisions.md) and the [README](../README.md#pre-commit-hook). A test commit with a badly formatted TypeScript file was rewritten by the hook inside the commit.

![Terminal: a test commit with a badly formatted TypeScript file; lint-staged runs ESLint and Prettier on the staged file, and the committed file is the formatted version](images/b1-pre-commit-hook.png)

**Open**

- None.

## C1: Source and artifact management

**Done**

- Workflow: issue → branch `type/<issue>-short-name` → small commits referencing the issue → pull request with `Closes #n` → CI green → squash merge → branch deleted automatically. Described in the [README](../README.md#workflow).
- `main` is protected by the ruleset `Protect main`: pull request required, the `build-and-test` check required, force pushes and deletions blocked, empty bypass list.
- Example: pull request [#3](https://github.com/TheVCrafter/isitdown/pull/3), squash merged as [`5ddd949`](https://github.com/TheVCrafter/isitdown/commit/5ddd949).
- A release workflow ([workflow file](../.github/workflows/release.yml)) builds a Docker image when a version tag is pushed and publishes it to the GitHub container registry. The image is tagged with the version and the commit, and labelled with its source repository and commit hash, so it can be traced back to its source.

![Ruleset Protect main: name, enforcement status Active, empty bypass list and the target branch](images/c1-ruleset-main-targets.png)

![Ruleset Protect main: branch rules for deletions, pull requests, status checks and force pushes](images/c1-ruleset-main-rules.png)

![Pull request #3 merged and its branch deleted](images/c1-pr-merged.png)

- First release: the tag `v0.1.1` started the release workflow, which published the image to the container registry with the tags `0.1.1`, `0.1`, `latest` and `sha-333019d`, the commit it was built from. The first tag, `v0.1.0`, failed because the Dockerfile was missing from the repository. It was added in a separate pull request, and the release was repeated with a new tag.

![Successful release run for tag v0.1.1: the publish-image job and the Docker build summary](images/c1-release-run.png)

![Package isitdown in the container registry: public, with the tags 0.1.1, 0.1, latest and sha-333019d](images/c1-package.png)

- Release `v0.1.2` was published and deployed by the same workflow run, so the image that runs on the server is traceable to its tag and commit.

**Open**

- None.

## D1: Integration and testing

**Done**

- Unit tests for the check logic (status rule, URL validation, the check with fake `fetch` functions for 2xx, 3xx, 4xx, 5xx, network error and timeout, and the output format). None of them use the real network.
- Tests for the SQLite storage use an in-memory database: a responded and a failed result come back unchanged, the history is newest first, results are separated by URL, and an unknown URL returns an empty list. One test uses a temporary file database to show that results survive closing and reopening it.
- Tests for the configuration and the scheduler: the interval and port settings accept valid values and reject invalid ones; the scheduler runs a round immediately, runs again after one interval, stops when asked, skips a tick while a round is still running, and reports a failing check or save without stopping the other URLs. The scheduler tests use fake timers and an in-memory storage.
- Tests for the uptime calculation: an empty list and a list without results in the period return `null`; all up, all down, half up and two thirds up return 100, 0, 50 and 66.7; results older than the period and results after the current time are ignored; a result exactly at the start of the period counts; a failed check counts as down.
- Tests for the history report and the selectable periods: the report contains only the results of the requested URL inside the period, newest first, with the matching uptime; the period names `1h`, `24h` and `7d` map to their durations, a missing period uses the default, and unknown names (including `constructor`) are rejected.
- Tests for the history server start the real server on a free port and send real HTTP requests: the report for a stored URL, the health endpoint, the default period, a URL without trailing slash, a missing or invalid URL, an unknown period, another path, a request that is not GET, the history page, and a failing storage that answers 500 without leaking the error message.
- An automated integration test runs the real checker, a real SQLite storage and the real history server against a local target server with four routes: a working page, a server error (500), a redirect, and a page that never answers. It checks the whole chain from the check to the report: the working page is up with 100 percent uptime, the server error is down with HTTP 500, the redirect is followed and reported as up, and the hanging page becomes a failed result that is stored and reported. The test runs as its own job in the pipeline, next to the unit tests, and needs no internet access.

![Pull request with two successful checks: build-and-test (required) and integration-test as a separate job](images/d1-ci-two-jobs.png)

- A run of the monitor with a 5 second interval, followed by a query of the database: the stored results of both runs are in the same file, which shows that results survive a restart.

![Stored check results of two separate runs of the monitor, read from the SQLite database](images/d1-monitor-storage.png)

- Demonstration of the story "Check whether a website is up or down":

![Command line run showing an up result, a down result with its error, a rejected input and the usage hint](images/d1-cli-output.png)

- Demonstration of the story "See the history and uptime of a monitored website": the page shows the uptime and the list of results of a monitored URL.

![History page showing the uptime and the list of results of a monitored URL](images/d1-history-page.png)

- The pipeline runs two jobs on every pull request and on every push to `main`: `build-and-test` (format check, lint, typecheck, build and unit tests) and `integration-test` ([workflow file](../.github/workflows/ci.yml)).
- A passing run on pull request #3:

![CI check build-and-test passed in 54 seconds on pull request #3](images/d1-ci-green.png)

- A pull request with a deliberately failing test was blocked from merging, because `build-and-test` is a required check. The pull request was closed without merging.

![Failing required check build-and-test and the disabled merge button](images/d1-ci-blocked-pr.png)

**Open**

- None.

## E1: Deployment

**Done**

- The hosting options are compared in [hosting](hosting.md): a Docker container on a server over SSH, a container platform, the own computer with a self-hosted runner, and GitHub Pages. The decision is a Docker container on a Linux server, because the pipeline can then set up the whole runtime.
- The server is an Oracle Cloud Always Free VM (Ubuntu 24.04, `x86_64`, 1 GB of memory). A key pair was created for the deployment, and the login with the key was tested.
- Automatic deployment: when a version tag is pushed, the release workflow publishes the image and then a `deploy` job connects to the server over SSH and runs a setup script ([workflow file](../.github/workflows/release.yml), [script](../deploy/remote-deploy.sh)). The script creates a swap file, installs Docker, pulls the image of exactly that version, and starts the container with a persistent data volume. Every step checks first whether it is needed, so the script can run again on every deployment.
- Configuration and secrets: the server address, the login user, the private key and the pinned host key are GitHub secrets, and the list of monitored websites is a repository variable. Nothing sensitive is in the repository.
- Safety measures: strict host key checking, a strict pattern for the version and the URL list before they reach the server, secrets passed as environment variables, minimal permissions per job, and one deployment at a time.
- The first deployment failed in the check of the URL list, because the variable was missing. The check stopped the run before anything reached the server, and the deployment was repeated after the variable was created.

![Release run for v0.1.2 with both jobs, publish-image and deploy, successful](images/e1-deploy-run.png)

![History page running on the server, showing the uptime and the results of a monitored website](images/e1-deployed-page.png)

- Health check after the deployment: the application has a `/health` endpoint, and the deploy job calls it from the GitHub runner over the internet after the container starts. It retries for about a minute and fails the deployment if the application does not answer with a healthy status. After a failure, the job prints the container's last log lines. The check passed in the deployment of `v0.1.3`, which shows that the container runs, the application answers, and the port is reachable from outside.

![Deploy job of the release v0.1.3: all steps successful, and the expanded health check step shows the application healthy on the first attempt](images/e1-health-check.png)

**Open**

- None.
