import {warn, danger} from "danger";

export default async () => {
    const githubLabels = danger.github.issue.labels;
    const modifiedFiles = danger.git.modified_files;
    const pr = danger.github.pr;

    // List of release notes files
    const releaseNotesFiles: string[] = [
        "RELEASE-NOTES.txt"
    ];

    // Skip if not on a release branch 
    if (!pr.base.ref.startsWith("release/")) {
        return;
    }

    // Skip for PR labeled as "Releases"
    if (githubLabels.length != 0) {
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }
    }
    
    for (let releaseNotes of releaseNotesFiles) {
        if (modifiedFiles.some(f => f.includes(releaseNotes))) {
            let messageText: string;

            messageText = "This PR contains changes to RELEASE_NOTES.txt.\n";
            messageText += "Note that these changes won't affect the final version of the release notes as this version is in code freeze.\n";
            messageText += "Please, get in touch with a release manager if you want to update the final release notes.";

            warn(messageText);
        }
    }
};
