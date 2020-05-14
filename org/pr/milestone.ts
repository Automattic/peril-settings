import {warn, danger} from "danger";

export default async () => {
    // Skip for release PRs and PRs against feature branches
    const githubLabels = danger.github.issue.labels;

    if (githubLabels.length != 0) {
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }

        const wipFeature = githubLabels.some(label => label.name.includes("Part of a WIP Feature"));
        if (wipFeature) {
            return;
        }
    }

    // Warn if the PR doesn't have a milestone
    const issue = await danger.github.api.issues.get(danger.github.thisPR);
    if (issue.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }
};
