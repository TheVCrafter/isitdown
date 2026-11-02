# Requirements management tools

IsItDown? is a solo project with a public repository. The requirements (three user stories with acceptance criteria and their tasks) have to be written down, linked to the code, and visible to someone who reviews the project. This document compares three tools for that job.

## Criteria

| Criterion                 | Why it matters here                                                               |
| ------------------------- | --------------------------------------------------------------------------------- |
| Link to the code          | A requirement should lead to the pull request that implements it, and back        |
| Structure of requirements | Stories with acceptance criteria and sub-tasks must be possible                   |
| Automation                | Status changes should follow the work without manual steps                        |
| Visibility                | A reviewer has to be able to see the board and its history                        |
| Cost and setup            | A solo school project should not need a paid plan or an extra account to maintain |

## Comparison

| Criterion                 | GitHub Projects                                                                                   | Jira                                                                                                                                      | Trello                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Link to the code          | Built in: issues and pull requests are the same system, and `Closes #n` closes the issue on merge | Through Atlassian's GitHub app: the Jira issue key in a commit, branch or pull request title shows them on the issue; the link is one way | Through the GitHub Power-Up, which attaches pull requests and commits to cards by hand; a GitHub Action can automate it |
| Structure of requirements | Issues with templates, labels, sub-issues and custom fields                                       | Strong: unlimited work items and spaces, custom fields and workflows, backlog and board views, also on the Free plan                      | Light: cards, lists and checklists; custom fields, advanced checklists and unlimited boards only on paid plans          |
| Automation                | Built-in workflows (for example done on close or merge) without extra tools                       | Rules with a monthly allowance: 150 automation steps per subscription on Free, 400 per user on Standard                                   | Built in on every plan; the Free and Standard plans have a monthly limit, only Premium and above have unlimited runs    |
| Visibility                | A public repository can have a public board, visible without an account                           | Boards cannot be made public; anonymous access to project issues is a plan-dependent feature                                              | A board can be made public; anyone with the link can view it without an account                                         |
| Cost and setup            | No extra account or cost; lives next to the code                                                  | Free forever for up to 10 users, with 2 GB of storage and community support; a separate site and account; paid plans are charged per user | Free plan for up to 10 collaborators per workspace; a separate account; paid plans are charged per user                 |

The plan limits were checked against the pricing pages of Jira and Trello on 2026-11-02. Plans, limits and prices change, so they should be checked again before relying on a number.

## Recommendation

Use GitHub Projects.

- The requirements and the code are in the same system, so the link from a user story to the pull request that implements it is automatic, in both directions, and cannot get out of date.
- Closing an issue through a pull request moves the card on the board without a separate tool or an automation allowance.
- The board is public together with the repository, so it can be reviewed without an account. Jira cannot offer that for boards.
- A solo project gains little from the extra structure of Jira, and Trello's simpler cards are weaker for acceptance criteria and traceability.

## Consequences

- The tracking depends on GitHub. If the repository moved elsewhere, the board would have to be moved too.
- Planning features such as sprint reports are limited compared with Jira. For a project of this size, the board, the sub-issue progress and the labels are enough.

## Sources

- [Jira pricing (Atlassian)](https://www.atlassian.com/software/jira/pricing)
- [Trello pricing (Atlassian)](https://trello.com/pricing)
- [Link GitHub workflows and deployments to Jira work items (Atlassian Support)](https://support.atlassian.com/jira-cloud-administration/docs/link-github-workflows-and-deployments-to-jira-issues/)
- [GitHub for Jira, frequently asked questions (Atlassian)](https://github.com/atlassian/github-for-jira/blob/main/docs/FAQs.md)
- [Use the GitHub Power-Up (Trello, Atlassian Support)](https://support.atlassian.com/trello/docs/using-the-github-power-up/)
- [Change the visibility of a board (Trello, Atlassian Support)](https://support.atlassian.com/trello/docs/changing-the-visibility-of-a-board/)
- [Allow anonymous view access to boards (Atlassian Community)](https://community.atlassian.com/forums/Jira-questions/Allow-anonymous-view-access-to-boards/qaq-p/3117892)
