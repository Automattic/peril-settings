import {warn, fail, danger} from "danger";

export default async () => {

    if (danger.github == null || danger.github.pr == null) {
        fail("Not running on a Github PR.");
        return;
    }

    console.log(Object.entries(danger.github));

    const githubLabels = danger.github.issue.labels;

    // A PR should have at least one label
    if (githubLabels.length == 0) {
        warn("PR is missing at least one label.");
    }

    // A PR shouldn't be merged with the 'DO NOT MERGE' label
    const doNotMerge = githubLabels.some(label => label.name.includes("DO NOT MERGE"));
    if (doNotMerge) {
        warn("This PR is tagged with 'DO NOT MERGE'.");
    }

    // Warn if the PR doesn't have a milestone
    const issue = await danger.github.api.issues.get(danger.github.thisPR);
    if (issue.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }

    // Warn when there is a big PR
    if (danger.github.pr.additions + danger.github.pr.deletions > 500) {
        warn("PR has more than 500 lines of code changing. Consider splitting into smaller PRs if possible.");
    }

};
