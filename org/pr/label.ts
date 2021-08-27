import {warn, danger} from "danger";

export default async () => {
    const githubLabels = danger.github.issue.labels;

    // A PR should have at least one label
    if (githubLabels.length == 0) {
        warn("PR is missing at least one label.");
    }

    // A PR shouldn't be merged with the 'DO NOT MERGE' label
    const doNotMerge = githubLabels.some(label => label.name.includes("DO NOT MERGE") || label.name.includes("status: do not merge"));
    if (doNotMerge) {
        warn("This PR is tagged with 'DO NOT MERGE'.");
    }
};
