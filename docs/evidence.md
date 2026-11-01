# Evidence

Evidence per competency band. Each section lists what exists, where to find it, and what is still open.

## A1: Requirements

**Done**

- Requirements are managed on a GitHub Project board (`IsItDown?`), linked to the repository.
- Statuses: Backlog, Todo, In Progress, In Review, Done. The board workflows add new issues to Backlog and move them to Done when an issue is closed or its pull request is merged.
- Issue templates for user stories and tasks, plus six labels (`user-story`, `feature`, `ci`, `docs`, `chore`, `bug`).
- Traceability example: issue [#2](https://github.com/TheVCrafter/isitdown/issues/2) (CI workflow) → branch `ci/2-add-workflow` → pull request [#3](https://github.com/TheVCrafter/isitdown/pull/3) with `Closes #2` → merged → issue closed and moved to Done automatically.

![Project board with issues #1 and #2 in the Done column](images/a1-board-overview.png)

![Issue #2 closed by pull request #3, with the project status Done and the timeline of board automation](images/a1-issue-closed-by-pr.png)

![Repository labels with descriptions](images/a1-labels.png)

**Open**

- User stories and the breakdown into issues for the monitoring features.
- Comparison of requirements management tools.

## B1: Development environment

**Done**

- Node.js, TypeScript (strict), ESLint, Prettier, Vitest and npm scripts for `lint`, `format`, `format:check`, `typecheck`, `build` and `test`.
- Editor and line ending setup: `.editorconfig`, `.gitattributes`, `.prettierrc` and shared VS Code settings in `.vscode/settings.json`.
- Setup steps for a fresh clone are in the [README](../README.md#setup); the reasons for the choices are in [decisions](decisions.md) and [TypeScript notes](typescript-notes.md).
- Setup commit: [`56daa85`](https://github.com/TheVCrafter/isitdown/commit/56daa85).

**Open**

- An extension beyond the basic setup (for example pre-commit hooks or a devcontainer), documented with its reason.

## C1: Source and artifact management

**Done**

- Workflow: issue → branch `type/<issue>-short-name` → small commits referencing the issue → pull request with `Closes #n` → CI green → squash merge → branch deleted automatically. Described in the [README](../README.md#workflow).
- `main` is protected by the ruleset `Protect main`: pull request required, the `build-and-test` check required, force pushes and deletions blocked, empty bypass list.
- Example: pull request [#3](https://github.com/TheVCrafter/isitdown/pull/3), squash merged as [`5ddd949`](https://github.com/TheVCrafter/isitdown/commit/5ddd949).

![Ruleset Protect main: name, enforcement status Active, empty bypass list and the target branch](images/c1-ruleset-main-targets.png)

![Ruleset Protect main: branch rules for deletions, pull requests, status checks and force pushes](images/c1-ruleset-main-rules.png)

![Pull request #3 merged and its branch deleted](images/c1-pr-merged.png)

**Open**

- Artifact management: a versioned build output created by the pipeline and linked to its source.

## D1: Integration and testing

**Done**

- The pipeline runs format check, lint, typecheck, build and tests on every pull request and on every push to `main` ([workflow file](../.github/workflows/ci.yml)).
- A passing run on pull request #3:

![CI check build-and-test passed in 54 seconds on pull request #3](images/d1-ci-green.png)

- A pull request with a deliberately failing test was blocked from merging, because `build-and-test` is a required check. The pull request was closed without merging.

![Failing required check build-and-test and the disabled merge button](images/d1-ci-blocked-pr.png)

**Open**

- Tests for the monitoring logic (currently only a placeholder test exists).
- An automated integration test that runs in the pipeline.

## E1: Deployment

Not started yet.
