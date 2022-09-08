import {warn, danger} from "danger";

export default async () => {
    // Create consts for everything we need from `danger` object as soon as possible
    // so it's not dropped during await operation
    const githubLabels = danger.github.issue.labels;
    const targetsDevelop = danger.github.pr.base.ref == "develop";
    const targetsRelease = danger.github.pr.base.ref.startsWith("release/");
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
        const wipFeature = githubLabels.some(label => label.name.includes("Part of a WIP Feature"));
        if (!targetsDevelop && !targetsRelease && wipFeature) {
            return;
        }
    }

    // Warn if the PR doesn't have a milestone
    if (currentPR.data.milestone == null) {
        warn("PR is not assigned to a milestone.");
        return;
    }

    // Warn if the milestone is closing in less than 2 days
    const warningDays = 2;
    const warningThreshold = warningDays * 1000 * 3600 * 24; // Convert days to milliseconds
    if ((currentPR.data.state != "closed") && (currentPR.data.milestone.due_on != null)) {
        const today = new Date();
        let dueDate : Date;
        dueDate = new Date();
        dueDate.setTime(Date.parse(currentPR.data.milestone.due_on));

        if ((dueDate.getTime() - today.getTime()) <= warningThreshold) {
            let messageText : string;

            messageText = `This PR is assigned to a milestone which is closing in less than ${warningDays} days\n`;
            messageText += `Please, make sure to get it merged by then or assign it to a later expiring milestone`;
            warn(messageText)
        }
    }
};
