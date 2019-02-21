import {warn, fail, danger} from "danger";

export default async () => {

    // Core Data Model Safety Checks
    const targetReleaseBranch = danger.github.pr.base.ref.startsWith("release/");
    const changedFiles = danger.git.modified_files.concat(danger.git.deleted_files).concat(danger.git.created_files);
    const hasModifiedModel = changedFiles.some(path => path.includes(".xcdatamodeld"));
    if (targetReleaseBranch && hasModifiedModel) {
        warn("Core Data: Do not edit an existing Core Data model in a release branch unless it hasn't been released to testers yet. Instead create a new model version and merge back to develop soon.");
    }

    // Podfile should not reference commit hashes
    const podfileContents = await danger.github.utils.fileContents("Podfile");
    const matches = podfileContents.match(/^[^#]*:commit/gm);
    if (matches !== null) {
        const nonGutenbergMatches = matches.filter(m => !m.includes("wordpress-mobile/gutenberg"));
        if (nonGutenbergMatches.length > 0) {
            fail("Podfile: reference to a commit hash");
        }
    }

    // If changes were made to the release notes, there must also be changes to the AppStoreStrings file.
    const hasModifiedReleaseNotes = danger.git.modified_files.some(f => f.endsWith("Resources/release_notes.txt"));
    const hasModifiedAppStoreStrings = danger.git.modified_files.some(f => f.endsWith("Resources/AppStoreStrings.po"));

    if (hasModifiedReleaseNotes && !hasModifiedAppStoreStrings) {
        fail("The AppStoreStrings.po file must be updated any time changes are made to release notes");
    }

};
