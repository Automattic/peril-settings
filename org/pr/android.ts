import {warn, danger} from "danger";

export default async () => {

    // If changes were made to the release notes in the metadata folder, there must also be changes to the PlayStoreStrings file.
    const modifiedFiles = danger.git.modified_files;
    const hasModifiedReleaseNotes = modifiedFiles.some(f => f.endsWith("metadata/release_notes.txt"));
    const hasModifiedPlayStoreStrings = modifiedFiles.some(f => f.includes("metadata/PlayStoreStrings.po"));

    if (hasModifiedReleaseNotes && !hasModifiedPlayStoreStrings) {
        warn("The PlayStoreStrings.po file must be updated any time changes are made to release notes");
    }

    // If changes were made to the strings, make sure they follow our guidelines
    const modifiedStrings = modifiedFiles.filter((path: string) => path.endsWith('values/strings.xml'))

    for (let file of modifiedStrings) {        
        const stringDiffs = await danger.git.diffForFile(file)

        for (let stringDiff of stringDiffs.added.replace(/\r/g, "").split(/\n/)) {
            if (stringDiff.includes("@string/") && (!stringDiff.includes("translatable=false"))) {
                let markdownText: string;

                markdownText = "This PR adds a translatable entry to \`strings.xml\` which references another string resource: this usually causes issues with translations."
                markdownText += "Please make sure to set the \`translatable=\"false\"\` attribute here:"
                markdownText += `\`${stringDiff}\``

                warn(markdownText);
            }
        }
    }
};
