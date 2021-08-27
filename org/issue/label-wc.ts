import {fail, danger} from "danger";

// This rule is for WooCommerce repos – which has slighly different label name conventions as other repos
export default async () => {
    const githubLabels = danger.github.issue.labels;

    // An issue should have at least one type label and at least one feature label

    // Type labels start with 'type: ' in WC repos
    const typeLabel = githubLabels.some(label => label.name.startsWith('type: '));
    if (!typeLabel) {
        fail("Please add a type label to this issue. e.g. 'type: enhancement'");
    }

    // Feature labels start with 'feature: ' in WC repos
    const featureLabel = githubLabels.some(label => label.name.startsWith('feature: '));
    if (!featureLabel) {
        fail("Please add a feature label to this issue. e.g. 'feature: stats'");
    }
};
