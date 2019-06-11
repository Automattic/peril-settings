import {message, warn, danger} from "danger";

export default async () => {

    // If changes were made to the release notes, there must also be changes to the PlayStoreStrings file.
    const hasModifiedReleaseNotes = danger.git.modified_files.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = danger.git.modified_files.some(f => f.includes("metadata/PlayStoreStrings.po"));
    
    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        warn("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }
    
    const libsLogin = "libs/login/";
    const modifiedFiles = danger.git.modified_files;
    const createdFiles = danger.git.created_files;
    const deletedFiles = danger.git.deleted_files;
    
    const containsLibsLoginChanges = modifiedFiles.some(f => f.includes(libsLogin)) || 
                                     createdFiles.some(f => f.includes(libsLogin)) ||
                                     deletedFiles.some(f => f.includes(libsLogin));

    if (containsLibsLoginChanges) {
        const api = danger.github.api;
        const pr = danger.github.pr
        const WPLFA = "WordPress-Login-Flow-Android";
        const wplfaMergeBranchName = `refs/heads/merge_${pr.repo}_${pr.number}`;
        let wplfaMergeBranchSha;
        let wplfaDevelopHead;
        
        // Create WPLFA branch
        try {
            console.log("PR contains changes in /libs/login!");
            console.log(`PR's mergeable status is: ${pr.mergeable}`);
            
            // console.log("### MPTEST ###");
            // console.log(JSON.stringify(danger.github.thisPR));
            // console.log("### MPTEST ###");
            // console.log(JSON.stringify(await api.repos.get({owner: "markpar", repo: "peril-settings"})));
            // console.log("### MPTEST ###");
        
            // Get HEAD for develop
            console.log("About to get refs/heads/develop");
            wplfaDevelopHead = await api.gitdata.getReference({owner: "markpar", repo: WPLFA, ref: "heads/develop"});
            console.log(`refs/heads/develop for ${WPLFA} is ${JSON.stringify(wplfaDevelopHead)}`);
            console.log(`refs/heads/develop for ${WPLFA} is ${Object.entries(wplfaDevelopHead)}`);
            console.log(`refs/heads/develop for ${WPLFA} is ${wplfaDevelopHead.data.object.sha}`);

            // Create ref (branch) based on HEAD
            // console.log("About to create branch");
            // wplfaMergeBranchSha = api.git.createRef(pr.owner, WPLFA, wplfaMergeBranchName, wplfaDevelopHead);
            // console.log(`Created ref ${wplfaMergeBranchName}, got SHA ${wplfaMergeBranchSha}`);
        }
        catch (e) {
            console.error(`!!! Caught error: ${e.message}`);
        }

        // Apply changes
        // Create PR
            // Comment on PR 
        // Poll for mergeability
            // Comment on PR, fail if there are conflicts
    }
};
