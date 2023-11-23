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

describe("Podfile should not reference branches checks", () => {
    it("fails when finds a brance reference", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - TestPod (from \`https://github.com/test/pod.git\`, branch \`trunk\`)
                    - WordPressKit (~> 6.1.0-beta)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a branch for TestPod");
    })

    it("fails when finds branch references in transitive dependencies", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - WordPressKit (~> 6.1.0-beta)
                    - TestPod (~> 1.7.2):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (from \`https://github.com/test/pod2.git\`, branch \`branch-name\`)
                      - TestDep3 (~> 1.7.2)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a branch for TestDep2");
    })

    it("fails when finds multiple branch references", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - TestPod (from \`https://github.com/test/pod.git\`, branch \`trunk\`):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (from \`https://github.com/test/pod2.git\`, branch \`my-feature-branch\`)
                      - TestDep3 (~> 1.7.2)
                    - WordPressKit (~> 6.1.0-beta):
                      - WordPressShared (from \`https://github.com/wordpress-mobile/WordPress-iOS-Shared.git\`, branch \`develop\`)
                    - StandalonePod (~> 1.2.7)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).toHaveBeenCalledWith("Podfile: reference to a branch for TestPod,TestDep2,WordPressShared");
    })

    it("does not fail when finds no branch references", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - WordPressKit (~> 6.1.0-beta)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    });

    it("does not fail when finds no branch references, including in transitive dependencies", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - WordPressKit (~> 6.1.0-beta)
                    - TestPod (~> 1.7.2):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (~> 1.7.2)
                      - TestDep3 (~> 1.7.2)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    });
})

describe("Podfile is allowed to reference commit hashes checks", () => {
    it("does not fail when finds a commit reference", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - TestPod (from \`https://github.com/test/pod.git\`, commit \`82f65c9cac2b59940db219a2327e12a0adfea4e3\`)
                    - WordPressKit (~> 6.1.0-beta)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled()
    })

    it("does not fail when finds commit references in transitive dependencies", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - WordPressKit (~> 6.1.0-beta)
                    - TestPod (~> 1.7.2):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (from \`https://github.com/test/pod2.git\`, commit \`5dbb1b2ef4b3b8157569df5878b9ea67e3a9377a\`)
                      - TestDep3 (~> 1.7.2)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    })

    it("doesn not fail when it finds multiple commit references", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - TestPod (from \`https://github.com/test/pod.git\`, commit \`82f65c9cac2b59940db219a2327e12a0adfea4e3\`):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (from \`https://github.com/test/pod2.git\`, commit \`5dbb1b2ef4b3b8157569df5878b9ea67e3a9377a\`)
                      - TestDep3 (~> 1.7.2)
                    - WordPressKit (~> 6.1.0-beta):
                      - WordPressShared (from \`https://github.com/wordpress-mobile/WordPress-iOS-Shared.git\`, commit \`e123bd0a9fef58a5897ed2101044f56a42e614c7\`)
                    - StandalonePod (~> 1.2.7)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    })

    it("does not fail when finds no commit", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - Gutenberg (from \`https://github.com/wordpress-mobile/gutenberg-mobile.git\`, tag \`v1.88.0\`)
                    - WordPressKit (~> 6.1.0-beta)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    });

    it("does not fail when finds no commit, including in transitive dependencies", async () => {
        dm.danger.github.utils.fileContents.mockReturnValueOnce(
            Promise.resolve(
                `DEPENDENCIES:
                    - WordPressKit (~> 6.1.0-beta)
                    - TestPod (~> 1.7.2):
                      - TestDep1 (~> 2.0-beta)
                      - TestDep2 (~> 1.7.2)
                      - TestDep3 (~> 1.7.2)
                `
            )
        );

        await iosMacos();

        expect(dm.fail).not.toHaveBeenCalled();
    });
})
