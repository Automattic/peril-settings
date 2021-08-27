jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import label from "../org/pr/label";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);
    dm.fail = jest.fn().mockReturnValue(true);

    dm.danger = {
        github: {
            issue: {
                labels: []
            },
        },
    };
});

describe("PR label checks", () => {
    it("warns if PR has no label", async () => {
        await label();

        expect(dm.warn).toHaveBeenCalledWith("PR is missing at least one label.");
    })

    it("fails if 'DO NOT MERGE' label is present", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'DO NOT MERGE'
            }
        ]

        await label();

        expect(dm.fail).toHaveBeenCalledWith("This PR is tagged with 'DO NOT MERGE' label.");
    })

    it("fails if 'status: do not merge' label is present (WC repo)", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'status: do not merge'
            }
        ]

        await label();

        expect(dm.fail).toHaveBeenCalledWith("This PR is tagged with 'status: do not merge' label.");
    })

    it("does not fail if there is no do-not-merge label", async () => {
        dm.danger.github.issue.labels = [
            {
                name: '[Status] Ready to Merge'
            }
        ]

        await label();

        expect(dm.fail).not.toHaveBeenCalled();
    })
})
