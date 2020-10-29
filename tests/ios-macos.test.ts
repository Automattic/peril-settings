jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import iosMacos from "../org/pr/ios-macos";

// The mocked data and return values for calls the rule makes.
beforeEach(() => {
    dm.warn = jest.fn().mockReturnValue(true);
    dm.message = jest.fn().mockReturnValue(true);
    dm.fail = jest.fn().mockReturnValue(true);

    dm.danger = {
        github: {
            pr: {
                base: {
                    ref: "",
                },
                head: {
                    ref: "",
                },
            },
            utils: {
                fileContents: jest.fn(),
            },  
            issue: {
                labels: []
            },
        },
        git: {
            modified_files: ["WordPress/Resources/en.lproj/Localizable.strings"],
            created_files: [],
            deleted_files: [],
        },
    };

    dm.danger.github.utils.fileContents.mockReturnValue(Promise.resolve(""));
});

describe("PR milestone checks", () => {
    it("warns when updating strings on not release branch", async () => {

        await iosMacos();
        
        expect(dm.warn).toHaveBeenCalledWith("Localizable.strings should only be updated on release branches because it is generated automatically.");
    })

    it("does not warn when pdating strings on release branch", async () => {
        dm.danger.github.pr.head.ref="release/1.1";

        await iosMacos();
        
        expect(dm.warn).not.toHaveBeenCalled();
    })

    it("does not warns when updating strings on not release branch and releases label", async () => {
        dm.danger.github.issue.labels = [
            {
                name: 'Releases'
            },
        ]

        await iosMacos();
        
        expect(dm.warn).not.toHaveBeenCalled();
        expect(dm.message).toHaveBeenCalledWith("This PR has the 'Releases' label: some checks will be skipped.");
    })
})

describe("Podfile should not reference commit hashes checks", () => {
    it("fails when finds a commit hash", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "pod 'MyTestPod', :git => 'https://github.com/my_test_pod/MyTestPod.git', :commit => '82f65c9cac2b59940db219a2327e12a0adfea4e3'"
                )    
            );

        await iosMacos();
        
        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a commit hash");
    })

    it("does not fail when finds a version", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "pod 'MyTestPod', '~> 1.1.0'"
                )    
            );

        await iosMacos();
        
        expect(dm.fail).not.toHaveBeenCalled();
    })

    it("fails when finds a commit hash (mobile gutenberg style)", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "gutenberg :commit => '84396ab3e79ff7cde5bf59310e1458336fd9b6b6'"
                )    
            );

        await iosMacos();
        
        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a commit hash");
    })

    it("does not fail when finds a version (mobile gutenberg style)", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "gutenberg :tag => 'v1.39.0'"
                )    
            );

        await iosMacos();
        
        expect(dm.fail).not.toHaveBeenCalled();
    })
})
