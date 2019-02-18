import {warn, danger} from "danger";

export default async () => {

    // Core Data Model Safety Checks
    const target_release_branch = danger.github.pr.base.ref.startsWith("release/");
    const changedFiles = danger.git.modified_files.concat(danger.git.deleted_files).concat(danger.git.created_files);
    const has_modified_model = changedFiles.some(path => path.includes(".xcdatamodeld"));
    if (target_release_branch && has_modified_model) {
        warn("Core Data: Do not edit an existing Core Data model in a release branch unless it hasn't been released to testers yet. Instead create a new model version and merge back to develop soon.");
    }

    console.log("About to do the Podfile check");
    console.log(`Object.keys(danger.github.utils): ${Object.keys(danger.github.utils)}`);
    console.log(`Object.keys(danger.git): ${Object.keys(danger.github)}`);

    // Podfile should not reference commit hashes
    if (danger.git.modified_files.includes("Podfile")) {
        const diff = await danger.git.diffForFile("Podfile");
        if (/\+[^#]*:commit/.test(diff.added)) {
            warn("Podfile: reference to a commit hash");
        }
    }

};