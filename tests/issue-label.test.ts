jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import label from "../org/issue/label";
import label_woo from "../org/issue/label-woo";

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

describe("issue label checks for non-WC repos", () => {
    it("fails with missing type label", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'Feature label'
            }
        ]

        await label();

        expect(dm.fail).toHaveBeenCalledWith("Please add a type label to this issue. e.g. '[Type] Enhancement'");
        expect(dm.fail).not.toHaveBeenCalledWith("Please add a feature label to this issue. e.g. 'Stats'");
    })

    it("fails with missing feature label", async () => {
        dm.danger.github.issue.labels = [
            {
                name: '[A Type] label'
            }
        ]

        await label();

        expect(dm.fail).not.toHaveBeenCalledWith("Please add a type label to this issue. e.g. '[Type] Enhancement'");
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

describe("issue label checks for WooCommerce repos", () => {
    it("fails with missing type label", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'feature: product details'
            }
        ]

        await label_woo();

        expect(dm.fail).toHaveBeenCalledWith("Please add a type label to this issue. e.g. 'type: enhancement'");
        expect(dm.fail).not.toHaveBeenCalledWith("Please add a feature label to this issue. e.g. 'feature: stats'");
    })

    it("fails with missing feature labels", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'type: bug'
            }
        ]

        await label_woo();

        expect(dm.fail).not.toHaveBeenCalledWith("Please add a type label to this issue. e.g. 'type: enhancement'");
        expect(dm.fail).toHaveBeenCalledWith("Please add a feature label to this issue. e.g. 'feature: stats'");
    })

    it("does not fail when the labels are present", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'type: bug'
            },
            {
                name: 'feature: product details'
            }
        ]

        await label_woo();

        expect(dm.fail).not.toHaveBeenCalled();
    })
})
