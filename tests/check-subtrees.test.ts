jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import checkSubtrees from "../org/pr/check-subtrees";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.message = jest.fn().mockReturnValue(true);

    dm.danger = {
        git: {
            modified_files: ["libs/login/modified-file.txt", "libs/utils/other-file.txt"],
            created_files: [],
            deleted_files: [],
        },
        github: {
            pr: {
                head: {
                    ref: "test-branch",
                }
            },
            thisPR: {
                repo: "test-wordpress-mobile",
                number: -1,
            },
        },
    };
});

describe("subtree checks", () => {
    it("adds merge instructions when PR contains changes in libs/login/", async () => {
        await checkSubtrees();

        // First, check that the merge instructions appear correct.
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes in the subtree `libs/login/`. It is your responsibility to ensure these changes are merged back into `wordpress-mobile/WordPress-Login-Flow-Android`."));

        // Then, ensure a piece of mock data is present.
        expect(dm.message).toHaveBeenCalledWith(expect.stringContaining(dm.danger.github.thisPR.repo));
    })
})
