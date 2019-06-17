jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import checkLoginSubtree from "../org/github/check-login-subtree";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);

    dm.danger = {
        git: {
            modified_files: ["libs/login/modified-file.txt"],
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

describe("/libs/login subtree check", () => {
    it("adds merge instructions when PR contains changes in libs/login/", async () => {
        await checkLoginSubtree();
        
        // First, check that the merge instructions appear correct.
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes in the subtree `libs/login/`"));
        
        // Then, ensure a piece of mock data is present.
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining(dm.danger.github.thisPR.repo));
    })
})