import {warn, danger} from "danger";

export default async () => {
    // Skip for release PRs
    const githubLabels = danger.github.issue.labels;
    const modifiedFiles = danger.git.modified_files;

    if (githubLabels.length != 0) {
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }
    }
    
    // Calculate the changes to Test files because we don't want to limit those
    const modifiedStrings = modifiedFiles.filter((path: string) => path.includes("/src/test"));
    let msg = ""
    let changesToTests = 0;
    for (let file of modifiedStrings) {        
        msg = msg + file + "\r\n";
        const stringDiffs = await danger.git.diffForFile(file)
        msg = msg + `\`${stringDiffs.added}\`\r\n` + `\`${stringDiffs.removed}\``;
        
        let addedStrings = stringDiffs.added.split("\n");
        let addedLines = addedStrings.filter(x => x.startsWith("+")).length;

        let removedLines = stringDiffs.removed.split("\n").filter(x => x.startsWith("-")).length;
        changesToTests += addedLines + removedLines;
    }

    // Warn when there is a big PR
    let codeChanges = danger.github.pr.additions + danger.github.pr.deletions - changesToTests;
    if (codeChanges > 300) {
        warn(`PR has more than 300 lines of code changing. Consider splitting into smaller PRs if possible. ([${codeChanges} - ${msg}])`);
    }
};
