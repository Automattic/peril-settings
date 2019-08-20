
import fetch from 'node-fetch'
jest.mock('node-fetch', () => jest.fn())

jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import androidInstallableBuild from "../org/pr/android-installable-build";

let mockedArtifacts = []

beforeEach(() => {
    fetch.mockImplementation(() => {
        return {
            ok: true,
            json: () => { return Promise.resolve(mockedArtifacts) }
        }
    })

    dm.danger = {
        github: {
          api: {
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
        log: jest.fn(),
    }
});

describe("installable APK handling", () => {
    it("bails when its not a success", async () => {
        await androidInstallableBuild({ state: "fail" } as any)
        expect(console.log).toBeCalledWith('Not a successful state - got fail')
    })

    it("bails when its an installable build status", async () => {
        await androidInstallableBuild({ state: "success", context: "ci/circleci: Tests" } as any)
        expect(console.log).toBeCalledWith('Not an installable build status check - got ci/circleci: Tests')
    })

    it("bails when there is no target_url", async () => {
        await androidInstallableBuild({ state: "success", context: "ci/circleci: Installable Build" } as any)
        expect(console.log).toBeCalledWith('No target_url on the successful status')
    })

    it("gets the artifacts for the CircleCI build, and bails when there are none", async () => {
        mockedArtifacts = []

        await androidInstallableBuild({
            state: "success",
            context: "ci/circleci: Installable Build",
            target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            }
        } as any)
        expect(console.log).toBeCalledWith('No APK artifact found on the build')
    })

    it("gets the artifacts for the CircleCI build, and bails when there are no APK artifacts", async () => {
        mockedArtifacts = [{
            path: 'artifact.zip',
            url: 'https://circleci.com/artifact.zip'
        }]

        await androidInstallableBuild({
            state: "success",
            context: "ci/circleci: Installable Build",
            target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            }
        } as any)
        expect(console.log).toBeCalledWith('No APK artifact found on the build')
    })

    it("gets the artifacts for the CircleCI build, and comments with the APK artifact", async () => {
        mockedArtifacts = [{
            path: 'artifact.apk',
            url: 'https://circleci.com/artifact.apk'
        }]

        // Gets a corresponding issue
        dm.danger.github.api.search.issuesAndPullRequests.mockReturnValueOnce(Promise.resolve({ data: { items: [{ number: 1 }] } }))

        // No existing comments
        dm.danger.github.api.issues.listComments.mockReturnValueOnce(Promise.resolve({data: []}))

        // Returns a PR without the right commit
        dm.danger.github.api.pulls.get.mockReturnValueOnce(
            Promise.resolve({ data: { head: { sha: "abc" } } })
        )

        // Comment on the PR
        dm.danger.github.api.issues.createComment.mockReturnValueOnce(Promise.resolve({data: { html_url: "https://github.com/comment_url" }}))

        await androidInstallableBuild({
            state: "success",
            context: "ci/circleci: Installable Build",
            target_url: "https://circleci.com/gh/Owner/Repo/12345?some=query",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            },
            commit: { sha: 'abc' }
        } as any)
        expect(console.log).toBeCalledWith('Posting comment for artifact.apk at https://circleci.com/artifact.apk')
        
        expect(dm.danger.github.api.issues.createComment).toBeCalledWith({
            owner: 'Owner',
            repo: 'Repo',
            number: 1,
            body: `You can test the changes on this Pull Request by downloading the APK [here](https://circleci.com/artifact.apk).`
        })

        expect(console.log).toBeCalledWith('APK download comment posted to https://github.com/comment_url')
    })
})
