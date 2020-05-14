import {warn, danger} from "danger";

export default async () => {
    const githubLabels = danger.github.issue.labels;
    const currentPR = await danger.github.api.pulls.get(danger.github.thisPR);

    // Skip for draft PRs
    if (currentPR.data.draft) {
        return;
    }

    if (githubLabels.length != 0) {
        // Skip for PRs with "Releases" label
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }

        // Skip for PRs for wip features unless the PR is against "develop" or "release/x.x" branches
        const targetsDevelop = danger.github.pr.base.ref == "develop";
        const targetsRelease = danger.github.pr.base.ref.startsWith("release/");
        const wipFeature = githubLabels.some(label => label.name.includes("Part of a WIP Feature"));
        if (!targetsDevelop && !targetsRelease && wipFeature) {
            return;
        }
    }

    // Warn if the PR doesn't have a milestone
    if (currentPR.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }
};
