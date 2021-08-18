import {warn, danger} from "danger";

export default async () => {
    // Skip for release PRs
    const githubLabels = danger.github.issue.labels;
    const modifiedFiles = danger.git.modified_files;
    const createdFiles = danger.git.created_files;
    const deletedFiles = danger.git.deleted_files;
    const additions = danger.github.pr.additions;
    const deletions = danger.github.pr.deletions;

    if (githubLabels.length != 0) {
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }
    }
    
    // Calculate the changes to Test files because we don't want to limit those
    // Note that linesOfCode() function in the latest GitDSL can solve this problem in a more elegant way,
    // but the version of Danger currently used by Peril doesn't have it yet.
    const testFiles = [...modifiedFiles, ...createdFiles, ...deletedFiles].filter((path: string) => path.includes("/src/test"));
    let changesToTests = 0;
    for (let file of testFiles) {        
        const stringDiffs = await danger.git.diffForFile(file)
        const addedLines = stringDiffs.added.split("\n").filter(x => x.startsWith("+")).length;
        const removedLines = stringDiffs.removed.split("\n").filter(x => x.startsWith("-")).length;
        changesToTests += addedLines + removedLines;
    }

    // Warn when there is a big PR
    let codeChanges = additions + deletions - changesToTests;
    if (codeChanges > 300) {
        warn("PR has more than 300 lines of code changing. Consider splitting into smaller PRs if possible.");
    }
};
