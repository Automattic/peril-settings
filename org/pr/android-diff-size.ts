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
    
    // Warn when there is a big PR
    if (danger.github.pr.additions + danger.github.pr.deletions > 300) {
        warn("PR has more than 300 lines of code changing. Consider splitting into smaller PRs if possible.");
    }
};
