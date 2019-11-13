import {warn, danger} from "danger";

export default async () => {

    // If changes were made to the release notes, there must also be changes to the PlayStoreStrings file.
    const modifiedFiles = danger.git.modified_files;
    const hasModifiedReleaseNotes = modifiedFiles.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = modifiedFiles.some(f => f.includes("metadata/PlayStoreStrings.po"));

    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        warn("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }

};
