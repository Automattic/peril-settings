jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import label from "../org/issue/label";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.fail = jest.fn().mockReturnValue(true);

    dm.danger = {
        github: {
            issue: {
                labels: []
            },
        },
    };
});

describe("issue label checks", () => {
    it("fails with missing type and feature labels", async () => {
        await label();
        
        expect(dm.fail).toHaveBeenCalledWith("Please add a type label to this issue. e.g. '[Type] Enhancement'");
        expect(dm.fail).toHaveBeenCalledWith("Please add a feature label to this issue. e.g. 'Stats'");
    })

    it("does not fail when the labels are present", async () => {
        dm.danger.github.issue.labels = [
            {
                name: '[A Type] label'
            },
            {
                name: 'Feature label'
            }
        ]

        await label();
        
        expect(dm.fail).not.toHaveBeenCalled();
    })
})
