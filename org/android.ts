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
        const org = "markpar";
        const WPLFA = "WordPress-Login-Flow-Android";

        const api = danger.github.api;
        const pr = danger.github.pr
        const mergeBranch = `refs/heads/merge/${pr.repo}/${pr.number}`;
        let mergeBranchHead: any;
        let destRepoHead: any;
        
        // Create WPLFA branch
        try {
            console.log("PR contains changes in /libs/login!");
            // console.log(`PR's mergeable status is: ${pr.mergeable}`);
            
            // Get HEAD for develop
            console.log(`Getting refs/heads/develop for ${org}/${WPLFA}`);
            destRepoHead = (await api.gitdata.getReference({owner: org, repo: WPLFA, ref: "heads/develop"})).data.object.sha;
            console.log(`Got refs/heads/develop for ${org}/${WPLFA}: SHA ${destRepoHead}`);

            // Create ref (branch) based on target repo branch HEAD
            console.log(`Creating merge branch: ${mergeBranch}`);
            mergeBranchHead = (await api.git.createReference({owner: org, repo: WPLFA, ref: mergeBranch, sha: destRepoHead})).data.object.sha;
            console.log(`Created ${mergeBranch}, SHA ${mergeBranchHead}`);
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
