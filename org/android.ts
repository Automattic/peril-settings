import {fail, danger} from "danger";

export default async () => {

    // If changes were made to the release notes, there must also be changes to the PlayStoreStrings file.
    const hasModifiedReleaseNotes = danger.git.modified_files.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = danger.git.modified_files.some(f => f.endsWith("metadata/PlayStoreStrings.po"));

    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        fail("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }

};
