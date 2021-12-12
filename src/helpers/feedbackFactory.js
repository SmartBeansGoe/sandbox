const typeRanking = {
    "EVALUATION_ERROR": 6,
    "COMPILE_ERROR": 5,
    "RUN_ERROR": 4,
    "TIMELIMIT": 3,
    "WRONG_ANSWER": 2,
    "SUCCESS": 1
};

// truncate all outputs; currently disabled
const truncate = s => s;
//const truncate = (s) => `${s}`.substr(50000); // truncate after 50k chars

export const compileError = (compileResult) => ({
    score: 0,
    type: "COMPILE_ERROR",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined
    },
});

export const runError = (compileResult, testResult, testCase) => ({
    score: 0,
    type: "RUN_ERROR",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined,
        testCase: {
            stdin: testCase?.stdin,
            stdout: truncate(testResult.stdout),
            exitCode: testResult.exitCode
        }
    }
});

export const wrongAnswerInputOutputTest = (compileResult, testResult, testCase) => ({
    score: 0,
    type: "WRONG_ANSWER",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined,
        testCase: {
            stdin: testCase.stdin,
            expectedStdout: testCase.stdout,
            stdout: truncate(testResult.stdout),
            exitCode: testResult.exitCode
        }
    }
});

export const wrongAnswerCodeTest = (compileResult, testResult) => ({
    score: 0,
    type: "WRONG_ANSWER",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined,
        testCase: {
            message: truncate(testResult.stdout)
        }
    }
});

export const successInputOutputTest = (compileResult, testResult, testCase) => ({
    score: 1,
    type: "SUCCESS",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined,
        testCase: {
            stdin: testCase.stdin,
            expectedStdout: testCase.stdout,
            stdout: truncate(testResult.stdout),
            exitCode: testResult.exitCode
        }
    }
});

export const successCodeTest = (compileResult, testResult) => ({
    score: 1,
    type: "SUCCESS",
    simplified: {
        compiler: compileResult ? {
            stdout: truncate(compileResult?.stdout),
            exitCode: compileResult?.exitCode
        } : undefined,
        testCase: {
            message: truncate(testResult.stdout)
        }
    }
});

export function reducer(prev, curr) {
    if (!prev) return curr;
    return typeRanking[prev.type] >= typeRanking[curr.type] ? prev : curr;
}