import * as sandbox from "../sandbox/sandbox.js";
import helper from "../sandbox/helper.cjs";
import fs from "fs/promises";
import * as feedbackFactory from "../helpers/feedbackFactory.js";

export async function evaluateInputOutputTask(sourceCode, tests) {
    const taskconfig = {
        "sourceFilename": "solution.py",
        "testCommand": "/usr/bin/python3",
        isolateflags: ["--stderr-to-stdout"]
    };
    /*
    1. create dir for the submission
        2. copy solution to a central place
        run all testcases through isolate containers; isolate takes care of synchronization
            6. get a container for execution
                7. execute
            8. dispose of execution container
            9. check for success and construct feedback
        10. accumulate feedback
    clean up
    */

    const testCases = tests.testCases;
    // 1. create dir for compilation products
    const submissionDir = `/submissions/${helper.generateID()}`; // place where the compilation result will be saved
    await helper.mkdir(submissionDir);
    await fs.writeFile(`${submissionDir}/${taskconfig.sourceFilename}`, sourceCode);

    // run all testcases through isolate containers; isolate takes care of synchronization
    const testPromises = testCases.map(async testCase => {
            // 6. get a container for execution
            const container = await sandbox.request();
            // 7. execute
            const execResult = await container.run([taskconfig.testCommand, `/data/${taskconfig.sourceFilename}`, ...testCase.args], [`--dir=/data=${submissionDir}`], testCase.stdin);
            console.log(JSON.stringify(execResult, null, 2));
            // 8. dispose of execution container
            sandbox.release(container); // we don't wait for the container to be released. Out result does not depend on it.
            // 9. check for success and construct feedback
            if (execResult.exitCode !== 0)
                return feedbackFactory.runError(undefined, execResult, testCase);
            // if (execResult.stderr === "Time limit exceeded\n")
            //     execResult.stdout += execResult.stderr;
            if (helper.diff(execResult.stdout, testCase.stdout))
                return feedbackFactory.wrongAnswerInputOutputTest(undefined, execResult, testCase);
            return feedbackFactory.successInputOutputTest(undefined, execResult, testCase);
        }
    );
    // 10. accumulate feedback
    let testResults = await Promise.all(testPromises);
    // clean up
    await helper.rmrf(submissionDir);
    return testResults.reduce(feedbackFactory.reducer);
}

export async function evaluateCodeTask(solution, test) {
    const taskconfig = {
        "sourceFilename": "solution.py",
        "testCommands": ["/usr/bin/python3", "-"],
        isolateflags: ["--stderr-to-stdout"]
    };
    const testPromises = test.testCases.map(async test => {
        // get a container
        const container = await sandbox.request();
        // copy solution to the container
        await fs.writeFile(`${container.path}/box/solution.py`, solution);
        // execute
        const execResult = await container.run(taskconfig.testCommands, taskconfig.isolateflags, test);
        // dispose of compilation container
        sandbox.release(container); // we don't wait for the container to be released. Out result does not depend on it.
        if (execResult.exitCode !== 0)
            return feedbackFactory.wrongAnswerCodeTest(undefined, execResult);
        return feedbackFactory.successCodeTest(undefined, execResult);
    });
    const testResults = await Promise.all(testPromises);
    return testResults.reduce(feedbackFactory.reducer);
}