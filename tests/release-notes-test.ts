jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import checkReleaseNotes from "../org/pr/release-notes";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);

    dm.danger = {
        git: {
            modified_files: ["RELEASE-NOTES.txt"],
            created_files: [],
            deleted_files: []
        },
        github: {
            pr: {
                base: {
                    ref: "release/1.0",
                }
            },
            issue: {
                labels: []
            },
        },
    };
});

describe("release notes checks", () => {
    it("warns when RELEASE-NOTES.txt is changed in a PR which targets a release branch", async () => {
        await checkReleaseNotes();
        
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("This PR contains changes to \`RELEASE_NOTES.txt\`.\n"));
    })

    it("does not warn when RELEASE-NOTES.txt is changed in a PR which targets a release branch if the PR is labeled with Releases", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'Releases'
            }
        ]

        await checkReleaseNotes();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warn when RELEASE-NOTES.txt is changed in a PR which doesn't target a release branch", async () => {
        dm.danger.github.pr.base.ref = "develop";

        await checkReleaseNotes();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warn when RELEASE-NOTES.txt is not changed", async () => {
        dm.danger.git.modified_files = [
                "file1.swift",
                "file2.php",
                "file3.kt"
        ]

        await checkReleaseNotes();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })
})

