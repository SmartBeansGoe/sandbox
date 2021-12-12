import * as sandbox from "../sandbox/sandbox.js";
import helper from "../sandbox/helper.cjs";
import fs from "fs/promises";
import * as feedbackFactory from "../helpers/feedbackFactory.js";

export async function evaluateInputOutputTask(solution, tests) {
    const taskconfig = {
        sourceFilename: "main.c",
        compilerCommand: "/usr/bin/clang",
        compilerFlags: [`-std=c11`, `-lm`, `-O2`/*, `-fsanitize=address`,*/],
        testCommand: "/data/a.out",
        isolateflags: ["--stderr-to-stdout"]
    };
    /*
    1. create dir for compilation products
        2. get a container for compilation
            3. copy solution to the container
            4. compile
                Return result iff compilation failed
            5. copy compilation products to out of the container
        dispose of compilation container
        run all testcases through isolate containers; isolate takes care of synchronization
            6. get a container for execution
                7. execute
            8. dispose of execution container
            9. check for success and construct feedback
        10. accumulate all feedback into one object
    clean up
    */

    const sourceCode = solution;
    const testCases = tests.testCases;
    // 1. create dir for compilation products
    const submissionDir = `/submissions/${helper.generateID()}`; // place where the compilation result will be saved
    await helper.mkdir(submissionDir);

    // 2. get a container for compilation
    const container = await sandbox.request();
    // 3. copy solution to the container
    // console.log(`copy to ${container.path}/${taskconfig.sourceFilename}:\n    ${sourceCode}`);
    await fs.writeFile(`${container.path}/box/${taskconfig.sourceFilename}`, sourceCode);
    // 4. compile
    const compileResult = await container.run([taskconfig.compilerCommand, ...taskconfig.compilerFlags, `/box/${taskconfig.sourceFilename}`], [`--dir=/usr/bin`], "");
    // console.log(JSON.stringify(compileResult, null, 2));
    // Return result iff compilation failed
    //return;
    if (compileResult.exitCode !== 0) {
        sandbox.release(container); // we don't wait for the container to be released. Out result does not depend on it.
        return feedbackFactory.compileError(compileResult);
    }
    // 5. copy compilation products to out of the container
    await helper.cp(`${container.path}/box/*`, submissionDir);
    // dispose of compilation container
    sandbox.release(container); // we don't wait for the container to be released. Out result does not depend on it.

    // run all testcases through isolate containers; isolate takes care of synchronization
    const testPromises = testCases.map(async testCase => {
            // 6. get a container for execution
            const container = await sandbox.request();
            // 7. execute
            const execResult = await container.run([taskconfig.testCommand, ...testCase.args], [`--dir=/data=${submissionDir}`], testCase.stdin);
            // console.log(JSON.stringify(execResult, null, 2));
            // 8. dispose of execution container
            sandbox.release(container);
            // 9. check for success and construct feedback
            if (execResult.exitCode !== 0)
                return feedbackFactory.runError(compileResult, execResult, testCase);
            // TODO fix TIMELIMIT
            // if (execResult.stderr === "Time limit exceeded\n")
            //     execResult.stdout += execResult.stderr;
            if (helper.diff(execResult.stdout, testCase.stdout))
                return feedbackFactory.wrongAnswerInputOutputTest(compileResult, execResult, testCase);
            return feedbackFactory.successInputOutputTest(compileResult, execResult, testCase);
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
        "sourceFilename": "main.c",
        "compilerCommand": "/usr/bin/clang",
        "testCommand": "/box/a.out",
        isolateflags: ["--stderr-to-stdout"]
    };
    const testPromises = test.testCases.map(async test => {
        // 2. get a container for compilation
        const container = await sandbox.request();
        // 3. copy solution to the container
        await fs.writeFile(`${container.path}/box/solution.c`, solution);
        await fs.writeFile(`${container.path}/box/test.c`, test);
        // 4. compile
        const compileResult = await container.run([taskconfig.compilerCommand, `/box/test.c`, `-lcunit`, `-lm`], taskconfig.isolateflags, "");
        // Return result iff compilation failed
        //return;
        if (compileResult.exitCode !== 0) {
            sandbox.release(container);
            return feedbackFactory.compileError(compileResult);
        }
        const execResult = await container.run([taskconfig.testCommand], taskconfig.isolateflags, "");
        // dispose of compilation container
        sandbox.release(container);
        if (execResult.exitCode !== 0)
            return feedbackFactory.wrongAnswerCodeTest(compileResult, execResult);
        return feedbackFactory.successCodeTest(compileResult, execResult);
    });
    const testResults = await Promise.all(testPromises);
    return testResults.reduce(feedbackFactory.reducer);
}
