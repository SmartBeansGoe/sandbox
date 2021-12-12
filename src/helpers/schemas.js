/**
 * Schemas for validating all incoming and outgoing data.
 */

import Joi from "joi";

const testsSchema = Joi.array().items({
    testtype: Joi.string().required(),
    testConstraints: Joi.any(),
    packages: Joi.any(),
    testCases: Joi.any().required()
});

export const taskSchema = Joi.object({
    shortname: Joi.string().max(20).required(),
    title: Joi.string().min(4).required(),
    taskid: Joi.number().min(1).required(),
    defaultEditorInput: Joi.string().allow(""),
    solution: Joi.string().required(),
    lang: Joi.alternatives().try("c", "python").required(),
    task: Joi.string().required(),
    tests: testsSchema.required(),
    testConstraints: Joi.object({
        timelimit: Joi.number().min(1), // in s
        filememory: Joi.number(), // in KB
        memory: Joi.number(), // in KB
        processes: Joi.number(),
    }),
    courses: Joi.object().pattern(Joi.alternatives().try("ckurs", "propäd"),
        Joi.object({
            tags: Joi.array().items(
                Joi.object({name: Joi.string(), points: Joi.number()})
            ).required(),
            orderBy: Joi.number().required(),
            // prerequisites as conjunctive normal form (without negated literals)
            prerequisites: Joi.array().items(Joi.array().items(Joi.number().min(1))).required()
            // ((401 || 402) && 403)
            // [[401,402],[403]]
            // [[401,402],403]
        })
    ).required()
});

export const submissionSchema = Joi.object({
    task: taskSchema.required(),
    submission: Joi.string().required()
});

export const evaluateInputSchema = Joi.object({
    taskid: Joi.number().min(1).required(),
    lang: Joi.string().required(),
    tests: testsSchema.required(),
    submission: Joi.string().required()
});

export const evaluateOutputSchema = Joi.object({
    type: Joi.alternatives().try(
        "COMPILE_ERROR", // only for compiled languages
        "RUN_ERROR",
        "TIMELIMIT",
        "WRONG_ANSWER",
        "EVALUATION_ERROR",
        "SUCCESS"
    ).required(),
    // reports only the first error in all test cases
    simplified: Joi.object({
        // if *NOT* EVALUATION_ERROR
        compiler: Joi.object({
            stdout: Joi.string().required(),
            exitCode: Joi.number().required()
        }),
        // if RUN_ERROR, WRONG_ANSWER or SUCCESS
        testCase: Joi.alternatives().try(
            // for CUNIT style tasks
            Joi.object({
                message: Joi.string().required()
            }),
            // for run errors
            Joi.object({
                stdin: Joi.string(),
                stdout: Joi.string().required(),
                exitCode: Joi.number().required()
            }),
            // for input/output style tasks
            Joi.object({
                stdin: Joi.string().required(),
                stdout: Joi.string().required(),
                expectedStdout: Joi.string().required(),
                exitCode: Joi.number().required()
            })
        )
    }),
    details: Joi.any(),
    score: Joi.number().min(0).max(1).required()
});



