"use strict";

import express from "express";
import cors from "cors";

const app = express();
import {port} from "./config.js";

// allow Cross Origin Requests
app.use(cors());
// let express parse json input
app.use(express.json());

import asyncHandler from "express-async-handler";

import * as errors from "./helpers/errors.js";
import * as schemas from "./helpers/schemas.js";
import * as feedbackFactory from "./helpers/feedbackFactory.js";

import * as cEvaluator from "./evaluators/c.js";
import * as pythonEvaluator from "./evaluators/python.js";

// for debugging purposes
app.get("/status", (req, res) => {
    res.send("Up and running!");
});

// evaluates a given program against an also supplied specification
app.post("/evaluate", asyncHandler(async (req, res) => {
    // input validation
    const inputValidationResult = schemas.evaluateInputSchema.validate(req.body, {abortEarly: false});
    if (inputValidationResult.error) {
        const msg = inputValidationResult.error.details.map(err => err.message || err).join("\n");
        console.error(msg);
        return res.status(400).send(msg);
    }

    // run test cases
    const lang = req.body.lang;
    /*
    There is usually only one test procedure for each task which runs multiple tests.
    Each test procedure has a type and we usually have at least

    - "code" tests which run a program e.g. a cunit test suite. This program is compiled once and executed once.
    - "input-output" tests which operate on pairs of stdin+stdout. The users program is compiled once and executed multiple times.

    As this might not fit more advanced cases (e.g. slow test cases in "code" tasks or multiple test types like an additional static analysis), we allow multiple tests.
    */
    const testRuns = req.body.tests.map(async test => {
        // default message
        let message = {
            type: "EVALUATION_ERROR",
            score: 0,
            details: "Unbekannter Fehler."
        };
        if (lang === "c") {
            if (test.testtype === "c-input-output") {
                message = await cEvaluator.evaluateInputOutputTask(req.body.submission, test);
                console.log(message);
            } else if (test.testtype === "c-code")
                message = await cEvaluator.evaluateCodeTask(req.body.submission, test);
            else
                message = errors.unsupportedTestType(req.body.lang, req.body.testtype);
        } else if (lang === "python") {
            if (test.testtype === "python-input-output")
                message = await pythonEvaluator.evaluateInputOutputTask(req.body.submission, test);
            else if (test.testtype === "python-code")
                message = await pythonEvaluator.evaluateCodeTask(req.body.submission, test);
            else
                message = errors.unsupportedTestType(req.body.lang, req.body.testtype);
        } else
            message = errors.unsupportedLanguage(req.body.lang);
        return message;
    });
    // aggregate all
    const testRunResults = (await Promise.all(testRuns)).reduce(feedbackFactory.reducer);

    // output validation
    const outputValidationResult = schemas.evaluateInputSchema.validate(req.body, {abortEarly: false});
    if (outputValidationResult.error) {
        const msg = outputValidationResult.error.details.map(err => err.message || err).join("\n");
        console.error(msg);
        return res.status(500).send(msg);
    }
    res.status(200).send(testRunResults);
}));

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

