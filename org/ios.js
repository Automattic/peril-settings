import {warn, danger} from "danger";

// Core Data Model Safety Checks
const target_release_branch = danger.github.pr.base.ref.startsWith("release/");
const changedFiles = danger.git.modified_files.concat(danger.git.deleted_files).concat(danger.git.added_files);
const has_modified_model = changedFiles.some(path => path.includes(".xcdatamodeld"));
if (target_release_branch && has_modified_model) {
    warn("Core Data: Do not edit an existing Core Data model in a release branch unless it hasn't been released to testers yet. Instead create a new model version and merge back to develop soon.");
}

// Podfile should not reference commit hashes
if (danger.git.modified_files.includes("Podfile")) {
    danger.git.diffForFile("Podfile").then(function(diff) {
        if (/\+[^#]*:commit/.test(diff.added)) {
            warn("Podfile: reference to a commit hash");
        }
    });
}