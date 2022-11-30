import {warn, fail, danger} from "danger";

export default async () => {
    const githubLabels = danger.github.issue.labels;

    // A PR should have at least one label
    if (githubLabels.length == 0) {
        warn("PR is missing at least one label.");
    }

    function is_do_not_merge_label(label) {
        const lc_label = label.name.toLowerCase();
        return lc_label.includes("do not merge") || lc_label.includes("not ready for merge");
    }

    // A PR shouldn't be merged with the 'DO NOT MERGE' label
    const doNotMergeLabel = githubLabels.find(is_do_not_merge_label);
    if (doNotMergeLabel) {
        fail(`This PR is tagged with '${doNotMergeLabel.name}' label.`);
    }
};
