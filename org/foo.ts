import {warn, danger} from "danger";
import * as child from "child_process";

export default async () => {
    try {
        runCommand("git clone https://github.com/markpar/WordPress-Android.git ~/repos/WordPress-Android");
    }
    catch (e) {
        if(e.stderr.toString().indexOf("already exists") >= 0) {
            console.log("repo already exists - cool!");
        }
        else {
            throw(e);
        }
    }

    // check out branch
    runCommand("cd ~/repos/WordPress-Android;git checkout mp-peril-test");

    // subtree split
};

 const runCommand = (command: string) => {
    console.log(`Executing: ${command}`);
    let result = child.execSync(command);
    console.log(`result is ${result.toString()}`);    
}