import {warn, danger} from "danger";

export default async () => {
    // Skip for release PRs
    const githubLabels = danger.github.issue.labels;

    if (githubLabels.length != 0) {
        const releases = githubLabels.some(label => label.name.includes("Releases"));
        if (releases) {
            return;
        }
    }
  
    // Warn if the PR doesn't have a milestone
    const issue = await danger.github.api.issues.get(danger.github.thisPR);
    if (issue.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
    }
};
