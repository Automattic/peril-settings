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
            modified_files: [],
            created_files: [],
            deleted_files: []
        }
    };

    dm.danger.github.utils.fileContents.mockReturnValue(Promise.resolve(""));
});

describe("Podfile should not reference commit hashes checks", () => {
    it("fails when finds a commit hash with Ruby pre-1.9 syntax", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "pod 'MyTestPod', :git => 'https://github.com/my_test_pod/MyTestPod.git', :commit => '82f65c9cac2b59940db219a2327e12a0adfea4e3'"
                )
            );

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a commit hash");
    })

    it("fails when finds a commit hash", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                "pod 'MyTestPod', git: 'https://github.com/my_test_pod/MyTestPod.git', commit: '82f65c9cac2b59940db219a2327e12a0adfea4e3'"
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

    it("fails when finds a commit hash (mobile gutenberg style, Ruby pre-1.9 syntax)", async () => {
        let podFile : string = "tag_or_commit = options[:tag] || options[:commit]\n";
        podFile += "gutenberg :commit => '84396ab3e79ff7cde5bf59310e1458336fd9b6b6'\n";
        dm.danger.github.utils.fileContents.mockReturnValueOnce(Promise.resolve(podFile));

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a commit hash");
    })

    it("fails when finds a commit hash (mobile gutenberg style)", async () => {
        let podFile : string = "tag_or_commit = options[:tag] || options[:commit]\n";
        podFile += "gutenberg commit: '84396ab3e79ff7cde5bf59310e1458336fd9b6b6'\n";
        dm.danger.github.utils.fileContents.mockReturnValueOnce(Promise.resolve(podFile));

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a commit hash");
    })

    it("does not fail when finds a version (mobile gutenberg style)", async () => {
        let podFile : string = "tag_or_commit = options[:tag] || options[:commit]\n";
        podFile += "gutenberg :tag => 'v1.39.0'\n";
        dm.danger.github.utils.fileContents.mockReturnValueOnce(Promise.resolve(podFile));

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    })
})
