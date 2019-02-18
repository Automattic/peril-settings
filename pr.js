/*jshint esversion: 8 */

import {warn, fail, danger} from "danger";

if (danger.github == null || danger.github.pr == null) {
    fail("Not running on a Github PR.");
    return;
}

const githubLabels = danger.github.issue.labels;

// A PR should have at least one label
if (githubLabels.length == 0) {
    warn("PR is missing at least one label.");
}

(async () => {
    // Warn if the PR doesn't have a milestone
    const issue = await danger.github.api.issues.get(danger.github.thisPR);
    if (issue.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }
})();


// A PR shouldn't be merged with the 'DO NOT MERGE' label
for (let label of githubLabels) {
    if (label.name.includes("DO NOT MERGE")) {
        warn("This PR is tagged with 'DO NOT MERGE'.");
        break;
    }
}

// Warn when there is a big PR
if (danger.github.pr.additions + danger.github.pr.deletions > 500) {
    warn("PR has more than 500 lines of code changing. Consider splitting into smaller PRs if possible.");
}

// Core Data Model Safety Checks
const target_release_branch = danger.github.pr.base.ref.startsWith("release/");
const changedFiles = danger.git.modified_files.concat(danger.git.deleted_files).concat(danger.git.created_files);
const has_modified_model = changedFiles.some(path => path.includes(".xcdatamodeld"));
if (target_release_branch && has_modified_model) {
    warn("Core Data: Do not edit an existing Core Data model in a release branch unless it hasn't been released to testers yet. Instead create a new model version and merge back to develop soon.");
}

(async () => {
    // Podfile should not reference commit hashes
    if (danger.git.modified_files.includes("Podfile")) {
        const diff = await danger.git.diffForFile("Podfile");
        if (/\+[^#]*:commit/.test(diff.added)) {
            warn("Podfile: reference to a commit hash");
        }
    }
})();
