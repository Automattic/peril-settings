jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import milestone from "../org/pr/milestone";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);

    dm.danger = {
        github: {
            api: {
                pulls: {
                    get: jest.fn(),
                },
            },
            issue: {
                labels: [],
            },
            pr: {
                base: {
                    ref: "",
                },
            }
        },
    };
});

describe("PR milestone checks", () => {
    it("warns with missing milestone", async () => {
        const mockData = { data: { draft: false, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        await milestone();

        expect(dm.warn).toHaveBeenCalledWith("PR is not assigned to a milestone.");
    })

    it("does not warn when the milestone is present", async () => {
        const mockData = { data: { draft: false, milestone: [{ number: 1 }] } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        await milestone();

        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warn with missing milestone and draft PR", async () => {
        const mockData = { data: { draft: true, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        await milestone();

        expect(dm.warn).not.toHaveBeenCalled();
    })


    it("does not warn with missing milestone and releases label", async () => {
        const mockData = { data: { draft: false, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        dm.danger.github.issue.labels = [
            {
                name: 'Releases'
            },
        ]

        await milestone();

        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("warns with missing milestone and wip feature label if the base branch is develop", async () => {
        const mockData = { data: { draft: false, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        dm.danger.github.issue.labels = [
            {
                name: 'Part of a WIP Feature',
            },
        ]
        dm.danger.github.pr.base.ref="develop";

        await milestone();

        expect(dm.warn).toHaveBeenCalledWith("PR is not assigned to a milestone.");
    })

    it("warns with missing milestone and wip feature label if the base branch is release", async () => {
        const mockData = { data: { draft: false, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        dm.danger.github.issue.labels = [
            {
                name: 'Part of a WIP Feature',
            },
        ]
        dm.danger.github.pr.base.ref="release/1.2";

        await milestone();

        expect(dm.warn).toHaveBeenCalledWith("PR is not assigned to a milestone.");
    })

    it("does not warn with missing milestone and wip feature label", async () => {
        const mockData = { data: { draft: false, milestone: null } };
        dm.danger.github.api.pulls.get.mockReturnValueOnce(Promise.resolve(mockData));

        dm.danger.github.issue.labels = [
            {
                name: 'Part of a WIP Feature',
            },
        ]

        await milestone();

        expect(dm.warn).not.toHaveBeenCalled();
    })
})
