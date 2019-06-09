import {message, warn, danger} from "danger";

export default async () => {

    // If changes were made to the release notes, there must also be changes to the PlayStoreStrings file.
    const hasModifiedReleaseNotes = danger.git.modified_files.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = danger.git.modified_files.some(f => f.includes("metadata/PlayStoreStrings.po"));
    
    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        warn("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }
    
    console.log("### MPTEST ###");
    const modifiedFiles = danger.git.modified_files;
    const createdFiles = danger.git.created_files;
    const deletedFiles = danger.git.deleted_files;

    console.log("Modified files: " + modifiedFiles.toString());
    console.log("Created files: " + createdFiles.toString());
    console.log("Deleted files: " + deletedFiles.toString());
    console.log("### MPTEST ###");

    const prContainsLibsLoginChanges = modifiedFiles.some(f => f.includes("libs/login/")) || 
                                       createdFiles.some(f => f.includes("libs/login/")) ||
                                       deletedFiles.some(f => f.includes("libs/login/"));
    if (prContainsLibsLoginChanges) {
        console.log("PR contains changes in /libs/login!");
    }
};
