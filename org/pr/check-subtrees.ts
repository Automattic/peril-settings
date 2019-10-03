import {message, danger} from "danger";

type Subtree = {
    repo: string;
    path: string;
}

/*
    This rule scans a PR for changes in a specific subtree and adds
    instructions for merging the changes back into the source repo.
*/
export default async () => {
    // Hard code the subtrees we search for here
    // We may want to define this on a per-repo basis at some point
    const subtrees: Subtree[] = [{
        repo: "wordpress-mobile/WordPress-Login-Flow-Android",
        path: "libs/login/"
    },
    {
        repo: "wordpress-mobile/WordPressMocks",
        path: "libs/mocks/"
    }];

    for (let subtree of subtrees) {
        // Look for subtree changes in the PR.
        console.log(`Scanning PR for changes in ${subtree.path}.`);
        const containsSubtreeChanges = danger.git.modified_files.some(f => f.includes(subtree.path)) ||
                                    danger.git.created_files.some(f => f.includes(subtree.path)) ||
                                    danger.git.deleted_files.some(f => f.includes(subtree.path));

        // If we found changes in the subtree folder, add instructions to the PR.
        if (containsSubtreeChanges) {
            console.log(`PR contains changes in ${subtree.path} subtree.  Adding merge instructions as a warning.`);

            // Handy accessor for some PR info.
            const pr = danger.github.thisPR;
            
            // The name of the branch that the `subtree push` command will create.
            const mergeBranch = `merge/${pr.repo}/${pr.number}`;

            // The merge instructions.
            let markdownText: string;

            // Put it all together! 
            markdownText = `This PR contains changes in the subtree \`${subtree.path}\`. It is your responsibility to ensure these changes are merged back into \`${subtree.repo}\`.  Follow these handy steps!\n`;
            markdownText += `WARNING: *Make sure your git version is 2.19.x or lower* - there is currently a bug in later versions that will corrupt the subtree history!\n`;
            markdownText += `1. \`cd ${pr.repo}\`\n`;
            markdownText += `2. \`git checkout ${danger.github.pr.head.ref}\`\n`;
            markdownText += `3. \`git subtree push --prefix=${subtree.path} https://github.com/${subtree.repo}.git ${mergeBranch}\`\n`;
            markdownText += `4. Browse to https://github.com/${subtree.repo}/pull/new/${mergeBranch} and open a new PR.`;
            
            message(markdownText);
        }

    }
};