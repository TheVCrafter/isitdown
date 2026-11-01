# Decisions

| Date       | Decision                                                                                | Reason                                                                                        |
| ---------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2026-10-31 | Create the repo on GitHub first, then clone it                                          | Remote, board and branch protection exist from the start; no history conflicts                |
| 2026-10-31 | Public repo and public project board                                                    | The board and PR history are evidence for A1 and C1 and must be visible                       |
| 2026-10-31 | Board statuses: Backlog, Todo, In Progress, In Review, Done                             | Simple Kanban flow; workflows move items to Backlog on add and Done on close/merge            |
| 2026-10-31 | Labels: user-story, feature, ci, docs, chore, bug                                       | Separate stories and tasks and show which area a change touches                               |
| 2026-10-31 | Issue templates for user story and task, plus a pull request template                   | Consistent issues and PRs; the `Closes #` line links PRs to issues                            |
| 2026-11-01 | Work folder `C:\dev\isitdown`, outside OneDrive                                         | OneDrive syncing `node_modules` is slow and can cause file lock errors                        |
| 2026-11-01 | Strict TypeScript, ES modules (`nodenext`)                                              | Catch errors early; modern module setup                                                       |
| 2026-11-01 | Prettier with LF line endings, plus `.gitattributes`                                    | CI runs on Linux; avoids CRLF noise and failing format checks                                 |
| 2026-11-01 | Initial setup commit directly on `main`                                                 | Only exception to the PR rule; no CI or protection existed yet                                |
| 2026-11-01 | CI runs on pull requests and pushes to `main`                                           | Every change is checked before and after merging                                              |
| 2026-11-01 | `engines` requires Node 22 or newer; CI uses Node 24                                    | Documents a minimum version; CI runs on a current LTS release                                 |
| 2026-11-01 | Squash merge for pull requests                                                          | One commit per issue keeps `main` readable                                                    |
| 2026-11-01 | Ruleset on `main`: PR required, `build-and-test` check required, 0 approvals, no bypass | Solo project, so no approvals; the rules still apply to me                                    |
| 2026-11-01 | `CheckResult` is a union of `Responded` and `Failed`, told apart by the `outcome` field | A failed check has no HTTP code or response time; the union makes impossible states untypable |
| 2026-11-01 | Every check result carries its `url`                                                    | A result stands on its own when it is stored or displayed                                     |
| 2026-11-01 | Timestamps are ISO 8601 strings                                                         | Easy to store as text and to compare in tests                                                 |
| 2026-11-01 | HTTP 200 to 399 is up; everything else is down; a failed check is always down           | Matches the acceptance criteria of the story; redirects count as a working site               |
