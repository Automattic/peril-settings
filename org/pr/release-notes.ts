// This Peril rule will warn if the `RELEASE-NOTES.txt` file has been changed in a PR targeting a `release/*` branch.
//
// This file should typically not be modified after code freeze (i.e. on the release branch).

import {warn, danger} from "danger";
import { Stream } from "stream";

export default async () => {
    const githubLabels = danger.github.issue.labels;
    const modifiedFiles = danger.git.modified_files;
    const pr = danger.github.pr;

    // List of release notes files
    const releaseNotesFiles: string[] = [
        "RELEASE-NOTES.txt"
    ];

    const checkedBranches: string[] = [
        "release/",
        "hotfix/"
    ];

    // Skip if not targeting a release branch
    if (!checkedBranches.some(branch => pr.base.ref.startsWith(branch))) {
        return;
    }

    // Skip for PR labeled as "Releases"
    if (githubLabels.length != 0) {
        if (githubLabels.some(label => label.name.includes("Releases"))) {
            return;
        }
    }
    
    for (let releaseNotes of releaseNotesFiles) {
        if (modifiedFiles.some(f => f.includes(releaseNotes))) {
            let messageText: string;

            messageText = "This PR contains changes to \`RELEASE_NOTES.txt\`.\n";
            messageText += "Note that these changes won't affect the final version of the release notes as this version is in code freeze.\n";
            messageText += "Please, get in touch with a release manager if you want to update the final release notes.";

            warn(messageText);
        }
    }
};
