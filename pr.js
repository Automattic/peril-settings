import {warn, fail, danger} from "danger"

if (danger.github == null || danger.github.pr == null) {
    fail("Not running on a Github PR.");
    return;
}

const githubLabels = danger.github.issue.labels

// A PR should have at least one label
if (githubLabels.count == 0) {
    warn("PR is missing at least one label.");
}

// Warn if the PR doesn't have a milestone
danger.github.api.issues.get(danger.github.thisPR).then(issue => {
    if (issue.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }
});

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
