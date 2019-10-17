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

    let hasChanges: boolean = false;
    for (let thisFile of tracksFiles) {
        // Look for subtree changes in the PR.
        console.log(`Scanning PR for changes in ${thisFile}.`);
        hasChanges = hasChanges || danger.git.modified_files.some(f => f.includes(thisFile));
    }

    return hasChanges;
}

async function checkCommitDiffs() {
    let hasChanges: boolean = false;
    for (let thisFile of danger.git.modified_files) {
        // Look for subtree changes in the PR.
        console.log(`Scanning changes in ${thisFile}.`);
        const diff = await danger.git.diffForFile(thisFile);
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