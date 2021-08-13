jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import diffSize from "../org/pr/android-diff-size";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);

    dm.danger = {
        git: {
            modified_files: [],
            created_files: [],
            deleted_files: []
        },
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
    it("does not warn with less than 300 lines", async () => {
        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("warns with more than 300 lines", async () => {
        dm.danger.github.pr.deletions = 101;

        await diffSize();
        
        expect(dm.warn).toHaveBeenCalledWith("PR has more than 300 lines of code changing. Consider splitting into smaller PRs if possible.");
    })

    it("does not warns with more than 300 lines and releases label", async () => {
        dm.danger.github.pr.deletions = 101;

        dm.danger.github.issue.labels = [
            {
                name: 'Releases'
            },
        ]

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines and additions to test files", async () => {
        dm.danger.github.pr.additions = 291;
        dm.danger.github.pr.deletions = 10;

        dm.danger.git.modified_files = ["MyProject/src/test/something/myTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData = { 
            added: "+ func someCode();\r\n+ let someOtherVar = 0;",
            removed: "" 
        };
        dm.danger.git.diffForFile.mockReturnValueOnce(Promise.resolve(mockData));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines and deletions to test files", async () => {
        dm.danger.github.pr.additions = 291;
        dm.danger.github.pr.deletions = 10;

        dm.danger.git.modified_files = ["MyProject/src/test/something/myTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData = { 
            added: "",
            removed: "- func someCode();\r\n- let someOtherVar = 0;" 
        };
        dm.danger.git.diffForFile.mockReturnValueOnce(Promise.resolve(mockData));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines and changes to test files", async () => {
        dm.danger.github.pr.additions = 291;
        dm.danger.github.pr.deletions = 12;

        dm.danger.git.modified_files = ["MyProject/src/test/something/myTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData = { 
            added: "+ func someNewCode();\r\n+ let someOtherNewVar = 0;",
            removed: "- func someCode();\r\n- let someOtherVar = 0;" 
        };
        dm.danger.git.diffForFile.mockReturnValueOnce(Promise.resolve(mockData));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines and changes to different test files", async () => {
        dm.danger.github.pr.additions = 291;
        dm.danger.github.pr.deletions = 13;

        dm.danger.git.modified_files = ["MyProject/src/test/something/myTestFile.ko", "MyProject/src/test/something/myOtherTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData1 = { 
            added: "+ func someNewCode();\r\n+ let someOtherNewVar = 0;",
            removed: "- func someCode();\r\n"
        };
        const mockData2 = { 
            added: "",
            removed: "- func someCode();\r\n- let someOtherVar = 0;" 
        };
        dm.danger.git.diffForFile
            .mockReturnValueOnce(Promise.resolve(mockData1))
            .mockReturnValueOnce(Promise.resolve(mockData2));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines, but some belong to added test files", async () => {
        dm.danger.github.pr.additions = 291;

        dm.danger.git.created_files = ["MyProject/src/test/something/myTestFile.ko", "MyProject/src/test/something/myOtherTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData1 = { 
            added: "+ func someNewCode();\r\n+ let someOtherNewVar = 0;",
            removed: ""
        };
        const mockData2 = { 
            added: "+ func someNewCode();\r\n+ let someOtherNewVar = 0;",
            removed: "" 
        };
        dm.danger.git.diffForFile
            .mockReturnValueOnce(Promise.resolve(mockData1))
            .mockReturnValueOnce(Promise.resolve(mockData2));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns with more than 300 lines, but some belong to removed test files", async () => {
        dm.danger.github.pr.additions = 291;

        dm.danger.git.deleted_files = ["MyProject/src/test/something/myTestFile.ko", "MyProject/src/test/something/myOtherTestFile.ko"];
        dm.danger.git.diffForFile = jest.fn();

        const mockData1 = { 
            added: "",
            removed: "- func someNewCode();\r\n- let someOtherNewVar = 0;"
        };
        const mockData2 = { 
            added: "",
            removed: "- func someNewCode();\r\n- let someOtherNewVar = 0;" 
        };
        dm.danger.git.diffForFile
            .mockReturnValueOnce(Promise.resolve(mockData1))
            .mockReturnValueOnce(Promise.resolve(mockData2));

        await diffSize();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })
})
