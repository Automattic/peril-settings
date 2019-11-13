import {message, danger} from "danger";

/*
    This rule scans a PR for tracks related changes and adds
    instructions for handling them.
*/
async function checkTracksManagementFiles() {
    // Hard coding the file name to check. 
    // This can be defined in the repo in the future. 
    const tracksFiles: string[] = [
        "AnalyticsTracker.kt",
        "LoginAnalyticsTracker.kt"
    ];

    const modifiedFiles = danger.git.modified_files;

    let hasChanges: boolean = false;
    for (let thisFile of tracksFiles) {
        // Look for subtree changes in the PR.
        console.log(`Scanning PR for changes in ${thisFile}.`);
        hasChanges = hasChanges || modifiedFiles.some(f => f.includes(thisFile));
    }

    return hasChanges;
}

async function checkCommitDiffs() {
    let hasChanges: boolean = false;
    
    const git = danger.git

    for (let thisFile of git.modified_files) {

        // Look for subtree changes in the PR.
        console.log(`Scanning changes in ${thisFile}.`);

        if (git === undefined) {
            console.log("About to crash due to an error")
            console.log("File:", thisFile)
            console.log("Danger Object: ", danger)

            if (danger !== undefined) {
                console.log("Danger is no longer defined")
            }
            else {
                console.log("Danger API Git Object", danger.api.git)
                console.log("Danger Git Object: ", danger.git)
            }
        }

        const diff = await git.diffForFile(thisFile);
        if (/AnalyticsTracker\.track/.test(diff.diff)) {
            hasChanges = true;
        }
    }

    return hasChanges;
}

export default async () => {
    const tracksFileChanged = await checkTracksManagementFiles();
    const commitDiffs = await checkCommitDiffs();

    if (tracksFileChanged || commitDiffs) {
        console.log(`Tracks related changes detected: publishing instructions.`);
        let messageText: string;

        // Put it all together! 
        messageText = `This PR contains changes to Tracks-related logic. Please ensure the following are completed:\n`;
        messageText += `**PR Author**\n`;
        messageText += `- The PR must be assigned the **Tracks** label\n`;
        messageText += `**PR Reviewer**\n`;
        messageText += `- The tracks events must be validated in the Tracks system.\n`;
        messageText += `- Verify the internal tracks spreadsheet has also been updated.`;
            
        message(messageText);
        console.log(`Done.`);
    }
};