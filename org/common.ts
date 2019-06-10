import {fail, danger} from "danger";

export default async () => {
    if (danger.github == null || danger.github.pr == null) {
        fail("Not running on a Github PR.");
        return;
    }
};
