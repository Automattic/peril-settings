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
        console.log("PR contains changes in /libs/login!");
        
        const org = "markpar";
        const destRepo = "WordPress-Login-Flow-Android";
        const destRepoBranch = "develop";

        const api = danger.github.api;
        const pr = danger.github.thisPR;
        const utils = danger.github.utils;

        const mergeBranch = `merge/${pr.repo}/${pr.number}`;
        let mergeBranchHead: any;
        let destRepoHead: any;
        
        // Create WPLFA branch
        try {
            console.log("Modified files: " + modifiedFiles.toString());
            console.log("Created files: " + createdFiles.toString());
            console.log("Deleted files: " + deletedFiles.toString());

            // Look for an existing merge branch.
            console.log(`Looking for an existing merge branch: ${mergeBranch}`);
            try {
                mergeBranchHead = (await api.gitdata.getReference({owner: org, repo: destRepo, ref: `heads/${mergeBranch}`})).data.object.sha;
                console.log(`Found ${mergeBranch}: SHA ${mergeBranchHead}`);
            }
            catch (e) {
                // The REST API returns a 404 if the request ref does not exist.
                if (e.code == 404) {
                    console.log(`Branch ${mergeBranch} not found, creating...`);
                    mergeBranchHead = null;
                }
                // Otherwise, not ours, so rethrow the error.
                else {
                    throw(e);
                }
            }
            
            // If we didn't find an existing merge branch, create a new one.
            if (mergeBranchHead == null) {
                // Get HEAD for destination branch.
                console.log(`Getting refs/heads/${destRepoBranch} for ${org}/${destRepo}`);
                destRepoHead = (await api.gitdata.getReference({owner: org, repo: destRepo, ref: `heads/${destRepoBranch}`})).data.object.sha;
                console.log(`Got refs/heads/${destRepoBranch} for ${org}/${destRepo}: SHA ${destRepoHead}`);
                
                // Create branch based on target repo branch HEAD.
                // (i.e. `git checkout -b`.)
                console.log(`Creating merge branch: ${mergeBranch}`);
                mergeBranchHead = (await api.gitdata.createReference({owner: org, repo: destRepo, ref: `refs/heads/${mergeBranch}`, sha: destRepoHead})).data.object.sha;
                console.log(`Created ${mergeBranch}: SHA ${mergeBranchHead}`);
            }

            // Apply changes
            console.log("Apply changes to merge branch");
            
            for (let file of createdFiles) {
                console.log(`Processing new file ${file}`);
                console.log("Getting contents...");
                let fileContents = await utils.fileContents(file);
                let encodedContents = Buffer.from(fileContents).toString('base64');
                console.log(`Encoded contents: ${encodedContents.substr(0,15)}...`);
                
                console.log(`Creating ${file} in ${mergeBranch}`);
                let commitSha = (await api.repos.createFile({owner: org, repo: destRepo, path: file, branch: mergeBranch, content: encodedContents, message: `Auto-commit by Peril`})).data.commit.sha;
                console.log(`Created ${file}: SHA ${commitSha}`)
            }

            // Create PR
            // Comment on PR 
            // Poll for mergeability
            // Comment on PR, fail if there are conflicts

        }
        catch (e) {
            console.error(`!!! Caught error: ${e.message}`);
            console.log(JSON.stringify(e));
        }
    }
};
