
jest.mock('node-fetch', () => jest.fn())

jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import optionalTests from "../org/pr/gb-mobile-ui-tests";

beforeEach(() => {
    dm.danger = {
        github: {
          api: {
            repos: {
                createStatus: jest.fn(),
            },
            search: {
              issuesAndPullRequests: jest.fn(),
            },
            issues: {
              createComment: jest.fn(),
              listComments: jest.fn()
            },
            pulls: {
              get: jest.fn(),
            }
          },
        },
      }

    ;(global as any).console = {
        log: jest.fn()
    }

    // Mock Github API for posting comments
    // Gets a corresponding issue
    dm.danger.github.api.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({ data: { items: [{ number: 1 }] } }))
    // No existing comments
    dm.danger.github.api.issues.listComments.mockReturnValueOnce(Promise.resolve({data: []}))
    // Returns a PR with the right commit
    dm.danger.github.api.pulls.get.mockReturnValueOnce(
        Promise.resolve({ data: { head: { sha: "abc" } } })
    )
    // Mock commenting on the PR
    dm.danger.github.api.issues.createComment.mockReturnValueOnce(Promise.resolve({data: { html_url: "https://github.com/comment_url" }}))
})

const expectComment = (webhook, commentBody) => {
  expect(dm.danger.github.api.issues.createComment).toBeCalledWith({
    owner: webhook.repository.owner.login,
    repo: webhook.repository.name,
    number: 1,
    body: `<!--- Optional Tests Comment --->\n${commentBody}`
  })
  expect(console.log).toBeCalledWith('Optional tests comment posted to https://github.com/comment_url')
}

describe("gutenberg mobile ui tests handling", () => {
    it("bails when its not a status/state we want to handle", async () => {
        await optionalTests({ state: "fail", context: "Failure context" } as any)
        expect(console.log).toBeCalledWith("Not a status we want to process for optional tests - got 'Failure context' (fail)")

        // await optionalTests({ state: "success", context: "ci/circleci: Test Android on Device" } as any)
        // expect(console.log).toBeCalledWith("Not a status we want to process for optional tests - got 'ci/circleci: Test Android on Device' (success)")

        await optionalTests({ state: "success", context: "ci/circleci: Test iOS on Device" } as any)
        expect(console.log).toBeCalledWith("Not a status we want to process for optional tests - got 'ci/circleci: Test iOS on Device' (success)")
    })

    it("updates the status to be 'success' when it is the right context, and comments", async () => {
        const webhook: any = {
            state: "pending",
            context: "ci/circleci: Test iOS on Device",// "ci/circleci: Test Android on Device" ],
            description: "Holding build",
            target_url: "https://circleci.com/workflow-run/abcdefg",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            },
            commit: { sha: 'abc' }
        }
        await optionalTests(webhook)

        expect(dm.danger.github.api.repos.createStatus).toBeCalledWith({
            owner: webhook.repository.owner.login,
            repo: webhook.repository.name,
            state: "success",
            context: webhook.context,
            description: webhook.description,
            target_url: webhook.target_url,
        })

        expectComment(webhook, `You can trigger optional full suite of UI tests for these changes by visiting CircleCI [here](${webhook.target_url}).`)
    })
})
