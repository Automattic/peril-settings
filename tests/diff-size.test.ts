jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import diffSize from "../org/pr/diff-size";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);

    dm.danger = {
        github: {
            pr: {
                additions: 200,
                deletions: 10  
            },
            issue: {
                labels: []
            },
        },
    };
});

describe("PR diff size checks", () => {
    it("does not warn with less than 500 lins", async () => {
        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("warns with more than 500 lines", async () => {
        dm.danger.github.pr.deletions = 301;

        await diffSize();
        
        expect(dm.warn).toHaveBeenCalledWith("PR has more than 500 lines of code changing. Consider splitting into smaller PRs if possible.");
    })

    it("does not warns with more than 500 lines and releases label", async () => {
        dm.danger.github.pr.deletions = 301;

        dm.danger.github.issue.labels = [
            {
                name: 'Releases'
            },
        ]

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })
})
