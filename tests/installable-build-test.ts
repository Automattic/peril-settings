
import fetch from 'node-fetch'
jest.mock('node-fetch', () => jest.fn())

jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import installableBuild from "../org/pr/installable-build";

let mockedCommentJson = {}
let mockedArtifacts = []

beforeEach(() => {
    fetch.mockImplementation((url) => {
      let result: any = mockedArtifacts
      if (url.includes('comment.json')) {
        result = mockedCommentJson
      }
      return {
          ok: true,
          json: () => { return Promise.resolve(result) }
      }
    })

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
    body: `<!--- Installable Build Comment --->\n${commentBody}`
  })
  expect(console.log).toBeCalledWith('Installable build comment posted to https://github.com/comment_url')
}

describe("installable build handling", () => {
    it("bails when its not a status/state we want to handle", async () => {
        await installableBuild({ state: "fail", context: "Failure context" } as any)
        expect(console.log).toBeCalledWith("Not a status we want to process for installable builds - got 'Failure context' (fail)")

        await installableBuild({ state: "success", context: "ci/circleci: Installable Build/Hold" } as any)
        expect(console.log).toBeCalledWith("Not a status we want to process for installable builds - got 'ci/circleci: Installable Build/Hold' (success)")
    })

    it("updates the status to be 'success' when it is the right context, and comments", async () => {
        const webhook: any = {
            state: "pending",
            context: "ci/circleci: Installable Build/Hold",
            description: "Holding build",
            target_url: "https://circleci.com/workflow-run/abcdefg",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            },
            commit: { sha: 'abc' }
        }
        await installableBuild(webhook)

        expect(dm.danger.github.api.repos.createStatus).toBeCalledWith({
            owner: webhook.repository.owner.login,
            repo: webhook.repository.name,
            state: "success",
            context: webhook.context,
            description: webhook.description,
            target_url: webhook.target_url,
        })

        expectComment(webhook, `You can trigger an installable build for these changes by visiting CircleCI [here](${webhook.target_url}).`)
    })

    // This is a special case to handle the Jetpack application: since it shares the repository with WordPress,
    // we don't want a "trigger" comment to be generated, but we still want the status of the job to be green when on hold
    it("updates the status to be 'success' when it is the right context, but doesn't comment", async () => {
      const webhook: any = {
          state: "pending",
          context: "ci/circleci: Installable Build/Approve Jetpack",
          description: "Holding build",
          target_url: "https://circleci.com/workflow-run/abcdefg",
          repository: {
              name: 'Repo',
              owner: { login: 'Owner' }
          },
          commit: { sha: 'abc' }
      }
      await installableBuild(webhook)

      expect(dm.danger.github.api.repos.createStatus).toBeCalledWith({
          owner: webhook.repository.owner.login,
          repo: webhook.repository.name,
          state: "success",
          context: webhook.context,
          description: webhook.description,
          target_url: webhook.target_url,
      })

      expect(dm.danger.github.api.issues.createComment).not.toHaveBeenCalled();
  })

    it("Posts a download comment with the content of comment.json when the standard context is used", async () => {
      mockedArtifacts = [{
        path: 'comment.json',
        url: 'https://circleci.com/comment.json'
      }]
      mockedCommentJson = {
        body: 'Mocked download comment.'
      }

      const webhook: any = {
        state: "success",
        context: "ci/circleci: Installable Build",
        description: "Building",
        target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
        repository: {
            name: 'Repo',
            owner: { login: 'Owner' }
        },
        commit: { sha: 'abc' }
      }
      await installableBuild(webhook)

      expectComment(webhook, "Mocked download comment.")
    })

    it("Posts a download comment with the content of comment.json when a custom context containing the app name is used", async () => {
      mockedArtifacts = [{
        path: 'comment.json',
        url: 'https://circleci.com/comment.json'
      }]
      mockedCommentJson = {
        body: 'Mocked download comment.'
      }

      const webhook: any = {
        state: "success",
        context: "ci/circleci: WordPress Installable Build",
        description: "Building",
        target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
        repository: {
            name: 'Repo',
            owner: { login: 'Owner' }
        },
        commit: { sha: 'abc' }
      }
      await installableBuild(webhook)

      expectComment(webhook, "Mocked download comment.")
    })

    it("Posts a download comment linking to an APK", async () => {
      mockedArtifacts = [{
        path: 'file.apk',
        url: 'https://circleci.com/file.apk'
      }]

      const webhook: any = {
        state: "success",
        context: "ci/circleci: Installable Build",
        description: "Building",
        target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
        repository: {
            name: 'Repo',
            owner: { login: 'Owner' }
        },
        commit: { sha: 'abc' }
      }
      await installableBuild(webhook)

      expectComment(webhook, `You can test the changes on this Pull Request by downloading the APK [here](${mockedArtifacts[0].url}).`)
    })

    it("Posts a download comment linking to multiple APKs", async () => {
      mockedArtifacts = [{
        path: 'Artifacts/file1.apk',
        url: 'https://circleci.com/artifacts/file1.apk',
        qrCode: 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https%3A%2F%2Fcircleci.com%2Fartifacts%2Ffile1.apk&choe=UTF-8'
      },{
        path: 'file2.apk',
        url: 'https://circleci.com/file2.apk',
        qrCode: 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https%3A%2F%2Fcircleci.com%2Ffile2.apk&choe=UTF-8'
      }]

      const webhook: any = {
        state: "success",
        context: "ci/circleci: Installable Build",
        description: "Building",
        target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
        repository: {
            name: 'Repo',
            owner: { login: 'Owner' }
        },
        commit: { sha: 'abc' }
      }
      await installableBuild(webhook)

      expectComment(webhook, `You can test the changes on this Pull Request by downloading the APKs:\n - [file1.apk](${mockedArtifacts[0].url})\n<img src="${mockedArtifacts[0].qrCode}" />\n\n - [file2.apk](${mockedArtifacts[1].url})\n<img src="${mockedArtifacts[1].qrCode}" />\n`)
    })
})
