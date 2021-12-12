/**
 * Test script for testing that the feedbackFactory templates are valid.
 * run with `node feedbackFactoryTester.js`
 */

import * as ff from "../src/helpers/feedbackFactory.js";
import * as schemas from "../src/helpers/schemas.js";

function assertConformity(data) {
    const validationResult = schemas.evaluateOutputSchema.validate(data, {abortEarly: false});
    if (validationResult.error) {
        console.error(`Error parsing:\n${JSON.stringify(data, null, 2)}`);
        throw new Error(validationResult.error);
    }
}
// sample data
const compileResult = {
    "exitCode": 0,
    "stdout": "compiled!",
};
const testResult = {
    "exitCode": 0,
    "stdout": "tested!",
};
const testCase = {
    "args": [],
    "stdin": "3\n",
    "stdout": "3 2 1\n"
};

assertConformity(ff.compileError(compileResult));
assertConformity(ff.runError(compileResult, testResult, testCase));
assertConformity(ff.wrongAnswerCodeTest(compileResult, testResult));
assertConformity(ff.wrongAnswerInputOutputTest(compileResult, testResult, testCase));
assertConformity(ff.successCodeTest(compileResult, testResult));
assertConformity(ff.successInputOutputTest(compileResult, testResult, testCase));
assertConformity(ff.reducer(ff.compileError(compileResult), ff.successInputOutputTest(compileResult, testResult, testCase)));
console.error(`Tests passed.`);