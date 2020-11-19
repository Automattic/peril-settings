jest.mock("danger", () => jest.fn());
import danger from "danger";
const dm = danger as any;

import androidLibrary from "../org/pr/android-library"

beforeEach(() => {
    dm.fail = jest.fn().mockReturnValue(true);
})

describe("Development Bintray versions check", () => {

  describe("when the base is not develop or trunk", () => {

    it("doesn't fail even when the version hasn't been changed", async () => {
      dm.danger = {
        github: { pr: { base: { ref: "a-branch" } } },
        git: {
          modified_files: ["path/to/a/file"],
          diffForFile: async () => { return { before: '', after: '' } }
        }
      }

      await androidLibrary()

      expect(dm.fail).not.toHaveBeenCalled();
    })

    it("doesn't fail if the version has been changed", async () => {
      dm.danger = {
        github: { pr: { base: { ref: "a-branch" } } },
        git: {
          modified_files: ["path/to/build.gradle"],
          diffForFile: async () => {
            return {
              before: 'versionName "1.2.3"',
              after: 'versionName "1.2.4"'
            }
          }
        }
      }

      await androidLibrary()

      expect(dm.fail).not.toHaveBeenCalled();
    })
  })

  describe("when the base is trunk", () => {

    describe("when build.gradle hasn't changed", () => {

      it("emits a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "trunk" } } },
          git: {
            modified_files: ["path/to/a/file"],
            diffForFile: async () => { return { before: "", after: "" } }
          }
        }

        await androidLibrary()

        expect(dm.fail).toHaveBeenCalledWith("Please update the library version before merging into `trunk`")
        expect(dm.fail).toHaveBeenCalledTimes(1)
      })
    })

    describe("when build.gradle has changed", () => {

      it("if the version hasn't changed emits a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "trunk" } } },
          git: {
            modified_files: ["path/to/a/file", "path/to/build.gradle"],
            diffForFile: async () => { return { before: '', after: '' }
            }
          }
        }

        await androidLibrary()

        expect(dm.fail).toHaveBeenCalledWith("Please update the library version before merging into `trunk`");
        expect(dm.fail).toHaveBeenCalledTimes(1)
      })

      it("if the version has changed doesn't emit a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "trunk" } } },
          git: {
            modified_files: ["path/to/a/file", "path/to/build.gradle"],
            diffForFile: async () => {
             return {
                before: 'versionName "1.2.3"',
                after: 'versionName "1.2.4"'
              }
            }
          }
        }

        await androidLibrary()

        expect(dm.fail).not.toHaveBeenCalled()
      })
    })
  })

  describe("when the base is develop", () => {

    describe("when build.gradle hasn't changed", () => {

      it("emits a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "develop" } } },
          git: {
            modified_files: ["path/to/a/file"],
            diffForFile: async () => { return { before: "", after: "" } }
          }
        }

        await androidLibrary()

        expect(dm.fail).toHaveBeenCalledWith("Please update the library version before merging into `develop`")
        expect(dm.fail).toHaveBeenCalledTimes(1)
      })
    })

    describe("when build.gradle has changed", () => {

      it("if the version hasn't changed emits a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "develop" } } },
          git: {
            modified_files: ["path/to/a/file", "path/to/build.gradle"],
            diffForFile: async () => { return { before: '', after: '' }
            }
          }
        }

        await androidLibrary()

        expect(dm.fail).toHaveBeenCalledWith("Please update the library version before merging into `develop`");
        expect(dm.fail).toHaveBeenCalledTimes(1)
      })

      it("if the version has changed doesn't emit a failure", async () => {
        dm.danger = {
          github: { pr: { base: { ref: "develop" } } },
          git: {
            modified_files: ["path/to/a/file", "path/to/build.gradle"],
            diffForFile: async () => {
             return {
                before: 'versionName "1.2.3"',
                after: 'versionName "1.2.4"'
              }
            }
          }
        }

        await androidLibrary()

        expect(dm.fail).not.toHaveBeenCalled()
      })
    })
  })
})
