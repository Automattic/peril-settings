jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import androidChecks from "../org/pr/android";

// The mocked data and return values for calls the rule makes.
async function getMockedDiff(customDiffs : string) {
    let diffString : string = "diff --git a/WordPress/src/main/res/values/strings.xml a/WordPress/src/main/res/values/strings.xml\n";
    diffString += "index eb1a3f999dc..87ac8c3793c 100644\n";
    diffString += "--- a/WordPress/src/main/res/values/strings.xml\n";
    diffString += "+++ b/WordPress/src/main/res/values/strings.xml\n";
    diffString += "<string name=\"login_epilogue_screen_title\">Logged in as</string>\n";
    diffString += customDiffs;

    return diffString;
}

beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);
});

describe("string checks", () => {
    it("warns when an entry which references another string resources is added without the translatable=false attribute", async () => {
        // Create mocks
        const mockDiffFromFile = await getMockedDiff("+++ <string name=\"login_prologue_screen_title\">@string/app_name</string>");
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["values/strings.xml"],
                diffForFile: async () => { return { added: mockDiffFromFile } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the instructions appear correct.
        let expectedText: string;
        expectedText = "This PR adds a translatable entry to \`strings.xml\` which references another string resource: this usually causes issues with translations."
        expectedText += "Please make sure to set the \`translatable=\"false\"\` attribute here:"
        expectedText += "\`+++ <string name=\"login_prologue_screen_title\">@string/app_name</string>\`"
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining(expectedText));
    })

    it("doesn't warn when an entry which references another string resources is added with the translatable=false attribute", async () => {
        // Create mocks
        const mockDiffFromFile = await getMockedDiff("+++ <string name=\"login_prologue_screen_title\" translatable=\"false\">@string/app_name</string>");
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["values/strings.xml"],
                diffForFile: async () => { return { added: mockDiffFromFile } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the no message is shown.
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("doesn't warn when strings resources are added to strings.xml", async () => {
        // Create mocks
        const mockDiffFromFile = await getMockedDiff("+++ <string name=\"login_prologue_screen_title\">A test string</string>");
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["values/strings.xml"],
                diffForFile: async () => { return { added: mockDiffFromFile } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the no message is shown.
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("doesn't warn when there are no changes in strings.xml", async () => {
        // Create mocks
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["a-file.kt"],
                diffForFile: async () => { return { added: 'getString(R.string.example)' } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the no message is shown.
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("warns when there are changes in metadata/release-notes.txt but not in metadata/PlayStoreStrings.po", async () => {
        // Create mocks
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["metadata/release_notes.txt"],
                diffForFile: async () => { return { before: 'initial release notes', after: 'final release notes' } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the instructions appear correct.
        expect(dm.warn).toHaveBeenCalledWith(expect.stringContaining("The PlayStoreStrings.po file must be updated any time changes are made to release notes"));
    })

    it("doesn't warn when there are changes in metadata/release-notes.txt and in metadata/PlayStoreStrings.po", async () => {
        // Create mocks
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["metadata/release_notes.txt", "metadata/PlayStoreStrings.po"],
                diffForFile: async () => { return { before: 'initial release notes', after: 'final release notes' } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the instructions appear correct.
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("doesn't warn when there are changes in /release-notes.txt", async () => {
        // Create mocks
        dm.danger = {
            github: { pr: { base: { ref: "a-branch" } } },
            git: {
                modified_files: ["release_notes.txt"],
                diffForFile: async () => { return { before: 'initial release notes', after: 'final release notes' } }
            }
        };
        
        // Run the checks
        await androidChecks();
        
        // Check that the instructions appear correct.
        expect(dm.warn).not.toHaveBeenCalled();
    })

})
