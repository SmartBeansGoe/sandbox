/**
 * Module for running tasks in isolate containers.
 * Isolate is a sandbox for securely executing untrusted programs https://github.com/ioi/isolate
 * Proper Usage:
 * 1. request() a container
 * 2. container.run() commands on the container
 * 3. finally release() the container
 */

// execa executes external commands
import execa from "execa";
import {NUMBER_OF_CONTAINERS} from "../config.js";
import IsolateOptions from "../helpers/isolateOptions.js";

// we use a semaphore for keeping track on our container resources
import sem from "semaphore-async-await";

// disable Exceptions on non-zero exit codes
const execaOptions = {
    reject: false
};

const rmrf = (path) => execa.command(`rm -rf ${path}/*`, {shell: true});
const Semaphore = sem.default;

const lock = new Semaphore(NUMBER_OF_CONTAINERS);
// we use 0...99 as our container ids
const availableContainerIDs = [...new Array(NUMBER_OF_CONTAINERS).keys()];

// initialize container
async function initContainer(id) {
    return (await execa("isolate", ["-b", `${id}`, "--init"], execaOptions)).stdout.trim();
}

// run command inside container
async function runInContainer(id, command, options, stdin) {
    if (availableContainerIDs.includes(id))
        throw new Error("Invalid container ID. Container might have been already released.");
    /*
    TODO: The part with isolate options is currently utter chaos and needs to be rewritten using the new isolateOption as basis.
    // TODO default options
    // TODO ram usage limit
     */
    const defaultArgs = (new IsolateOptions())
        .boxId(id)
        .timeLimit(5)
        .fsize(1000000)
        .mem(5000000)
        .processes(10)
        .stderrToStdout();

    const isolateargs = [...defaultArgs.args, ...options];
    console.log(["isolate", [...isolateargs, "--run", "--", ...command].join(" "), JSON.stringify({
        ...execaOptions,
        input: stdin
    })].join(" "));
    return execa("isolate", [...isolateargs, "--run", "--", ...command], {
        ...execaOptions,
        input: stdin
    });
}

// remove container
async function cleanupContainer(id, path) {
    await rmrf(path);
    await execa("isolate", ["-b", `${id}`, "--cleanup"]);
}

// Container-generator (i.e. class) that gets passed out
function Sandbox(id, path) {
    this.id = id;
    this.path = path;
    this.run = (command, options, stdin) => runInContainer(id, command, options, stdin);
    Object.freeze(this);
}

// request new container
export async function request() {
    await lock.acquire();
    const id = availableContainerIDs.pop();
    const path = await initContainer(id);
    return new Sandbox(id, path);
}

// release container afterwards
export async function release(container) {
    // delete all files in the container
    await cleanupContainer(container.id, container.path);
    availableContainerIDs.push(container.id);
    // make the container invalid
    //container.id = undefined;
    //container.path = undefined;
    lock.release();
}
