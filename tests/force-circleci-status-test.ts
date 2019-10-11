jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import forceCircleCIStatus from "../org/pr/force-circleci-status";

beforeEach(() => {
    dm.danger = {
        github: {
          api: {
            repos: {
                createStatus: jest.fn(),
            }
          },
        },
      }

    ;(global as any).console = {
        log: jest.fn(),
    }
})

describe("installable APK handling", () => {
    it("bails when its not a pending status", async () => {
        await forceCircleCIStatus({ state: "fail" } as any)
        expect(console.log).toBeCalledWith('Not a pending state - got fail')

        await forceCircleCIStatus({ state: "success" } as any)
        expect(console.log).toBeCalledWith('Not a pending state - got success')
    })

    it("bails when its not a context which we want to force", async () => {
        await forceCircleCIStatus({ state: "pending", context: "ci/circleci: Test" } as any)
        expect(console.log).toBeCalledWith('Not a status we want to force success - got ci/circleci: Test')
    })

    it("updates the status to be 'success' when it is the right context", async () => {
        const webhook: any = {
            state: "pending",
            context: "ci/circleci: Installable Build/Hold",
            description: "Holding build",
            target_url: "https://circleci.com/workflow-run/abcdefg",
            repository: {
                name: 'Repo',
                owner: { login: 'Owner' }
            }
        }
        await forceCircleCIStatus(webhook)

        expect(dm.danger.github.api.repos.createStatus).toBeCalledWith({
            owner: webhook.repository.owner.login,
            repo: webhook.repository.name,
            state: "success",
            context: webhook.context,
            description: webhook.description,
            target_url: webhook.target_url,
        })
    })
})
