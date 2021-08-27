import {fail, danger} from "danger";

// Note: This rule does not apply to WooCommerce repo (which instead uses `label-wc.ts` and different label names)
export default async () => {
    const githubLabels = danger.github.issue.labels;

    // An issue should have at least one type label and at least one feature label

    // Type labels start with [Something]
    const typeRegex = RegExp('^\\[.+\\].*');
    const typeLabel = githubLabels.some(label => typeRegex.test(label.name));
    if (!typeLabel) {
        fail("Please add a type label to this issue. e.g. '[Type] Enhancement'");
    }

    // Feature labels don't start with [Something]
    const featureLabel = githubLabels.some(label => !typeRegex.test(label.name));
    if (!featureLabel) {
        fail("Please add a feature label to this issue. e.g. 'Stats'");
    }
};
