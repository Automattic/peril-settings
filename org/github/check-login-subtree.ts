import {message, danger} from "danger";

/*
    This rule scans a PR for changes in a specific subtree and adds
    instructions for merging the changes back into the source repo.
*/
export default async () => {
    
    // The subtree path we monitor.
    const subtreePath = "libs/login/";
    
    // Look for subtree changes in the PR.
    console.log(`Scanning PR for changes in ${subtreePath}.`);
    const containsSubtreeChanges = danger.git.modified_files.some(f => f.includes(subtreePath)) ||
                                   danger.git.created_files.some(f => f.includes(subtreePath)) ||
                                   danger.git.deleted_files.some(f => f.includes(subtreePath));

    // If we found changes in the subtree folder, add instructions to the PR.
    if (containsSubtreeChanges) {
        console.log(`PR contains changes in ${subtreePath} subtree.  Adding merge instructions as a warning.`);
        
        // Where the subtree changes need to go.
        const destRepo = "WordPress-Login-Flow-Android";
        
        // Repo owner.
        const org = "wordpress-mobile";
        
        // Handy accessor for some PR info.
        const pr = danger.github.thisPR;
        
        // The name of the branch that the `subtree push` command will create.
        const mergeBranch = `merge/${pr.repo}/${pr.number}`;

        // The merge instructions.
        let markdownText: string;

        // Put it all together! 
        markdownText = `This PR contains changes in the subtree \`${subtreePath}\`.  It is your responsibility to ensure these changes are merged back into \`${destRepo}\`.  Follow these handy steps!\n`;
        markdownText += `WARNING: *Make sure your git version is 2.19.x or lower* - there is currently a bug in later versions that will corrupt the subtree history!\n`;
        markdownText += `1. \`cd ${pr.repo}\`\n`;
        markdownText += `2. \`git checkout ${danger.github.pr.head.ref}\`\n`;
        markdownText += `3. \`git subtree push --prefix=${subtreePath} https://github.com/${org}/${destRepo}.git ${mergeBranch}\`\n`;
        markdownText += `4. Browse to https://github.com/${org}/${destRepo}/pull/new/${mergeBranch} and open a new PR.`;
        
        message(markdownText);
    }
};