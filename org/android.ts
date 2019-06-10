import {message, warn, danger} from "danger";

export default async () => {

    // If changes were made to the release notes, there must also be changes to the PlayStoreStrings file.
    const hasModifiedReleaseNotes = danger.git.modified_files.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = danger.git.modified_files.some(f => f.includes("metadata/PlayStoreStrings.po"));
    
    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        warn("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }
    
    console.log("### MPTEST ###");
    const libsLogin = "libs/login/";
    const modifiedFiles = danger.git.modified_files;
    const createdFiles = danger.git.created_files;
    const deletedFiles = danger.git.deleted_files;

    console.log("Modified files: " + modifiedFiles.toString());
    console.log("Created files: " + createdFiles.toString());
    console.log("Deleted files: " + deletedFiles.toString());
    console.log("### MPTEST ###");

    const containsLibsLoginChanges = modifiedFiles.some(f => f.includes(libsLogin)) || 
                                     createdFiles.some(f => f.includes(libsLogin)) ||
                                     deletedFiles.some(f => f.includes(libsLogin));
    if (containsLibsLoginChanges) {
        console.log("PR contains changes in /libs/login!");
        const api = danger.github.api;
        const pr = danger.github.thisPR
        const WPLFA = "WordPress-Login-Flow-Android";
        const wplfaMergeBranchName = `refs/heads/merge_${pr.repo}_${pr.number}`;

        // Create WPLFA branch
        // Get HEAD for develop
        console.log("About go get refs/heads/develop");
        const wplfaDevelopHead = api.getRef(pr.owner, WPLFA, "refs/heads/develop");
        console.log(`refs/heads/develop for ${WPLFA} is ${wplfaDevelopHead}`);

        // Create ref (branch) based on HEAD
        console.log("About to create branch");
        const wplfaMergeBranchSha = api.createRef(pr.owner, WPLFA, wplfaMergeBranchName, wplfaDevelopHead);
        console.log(`Created ref ${wplfaMergeBranchName}, got SHA ${wplfaMergeBranchSha}`);

        // Apply changes
        // Create PR
            // Comment on PR 
        // Poll for mergeability
            // Comment on PR, fail if there are conflicts
    }
};
