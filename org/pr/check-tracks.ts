import {message, danger} from "danger";

/*
    This rule scans a PR for tracks related changes and adds
    instructions for handling them.
*/
async function checkTracksManagementFiles(modifiedFiles: string[]) {
    // Hard coding the file name to check. 
    // This can be defined in the repo in the future. 
    const tracksFiles: string[] = [
        "AnalyticsTracker.kt",
        "AnalyticsEvent.kt",
        "LoginAnalyticsTracker.kt",
        "WooAnalyticsStat.swift"
    ];

    let hasChanges: boolean = false;
    for (let thisFile of tracksFiles) {
        // Look for subtree changes in the PR.
        console.log(`Scanning PR for changes in ${thisFile}.`);
        hasChanges = hasChanges || modifiedFiles.some(f => f.includes(thisFile));
    }

    return hasChanges;
}

async function checkCommitDiffs(modifiedFiles: string[], git: any) {
    let hasChanges: boolean = false;
    
    for (let thisFile of modifiedFiles) {
        // Look for subtree changes in the PR.
        console.log(`Scanning changes in ${thisFile}.`);
        const diff = await git.diffForFile(thisFile);
        if (/AnalyticsTracker\.track/.test(diff.diff)) {
            hasChanges = true;
        }
    }

    return hasChanges;
}

export default async () => {
    // Store the relevant data
    // This is a workaround for a weird issue/glitch we have been experiencing
    // where, sometimes, the data is not accessible later in the flow
    const modifiedFiles = danger.git.modified_files;

    const tracksFileChanged = await checkTracksManagementFiles(modifiedFiles);
    const commitDiffs = await checkCommitDiffs(modifiedFiles, danger.git);

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