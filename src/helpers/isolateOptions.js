/*
Use with care. There is no undo and you need to take care of overwriting options (which is not always possible).
 */

export default function IsolateOptions() {
    this.args = [];
}

IsolateOptions.prototype["boxId"] = function (id) {this.args.push(`--box-id=${id}`);return this;} // When multiple sandboxes are used in parallel each must get a unique ID
IsolateOptions.prototype["cg"] = function () {this.args.push("--cg");return this;} // Enable use of control groups
IsolateOptions.prototype["cg-mem"] = function (size) {this.args.push(`--cg-mem=${size}`);return this;} // Limit memory usage of the control group to <size> KB
IsolateOptions.prototype["cg-timing"] = function () {this.args.push(`--cg-timing`);return this;} //  // Time limits affects total run time of the control group (this is turned on by default, use --no-cg-timing to turn off)
IsolateOptions.prototype["chdir"] = function (dir) {this.args.push(`--chdir=${dir}`);return this;} // Change directory to <dir> before executing the program
IsolateOptions.prototype["dir"] = function (mapper) {this.args.push(`--dir=${mapper}`);return this;}
    /* Mount directories:
    <dir>		Make a directory <dir> visible inside the sandbox
    <in>=<out>	Make a directory <out> outside visible as <in> inside
    <in>=		Delete a previously defined directory rule (even a default one)
    ...:<opt>	Specify options for a rule:
                dev	Allow access to special files
                fs	Mount a filesystem (e.g., --dir=/proc:proc:fs)
                maybe	Skip the rule if <out> does not exist
                noexec	Do not allow execution of binaries
                rw	Allow read-write access
                tmp	Create as a temporary directory (implies rw)
    */
IsolateOptions.prototype["no-default-dirs"] = function () { this.args.push(`--no-default-dirs`);return this;}  // Do not add default directory rules
IsolateOptions.prototype["fsize"] = function (sizeInKB) { this.args.push(`--fsize=${sizeInKB}`);return this;} // Max size (in KB) of files that can be created
IsolateOptions.prototype["env_inherit"] = function (key) { this.args.push(`--env=${key}`);return this;} // Inherit the environment variable <var> from the parent process
IsolateOptions.prototype["env_set"] = function (key, value) { this.args.push(`--env=${key}=${value}`);return this;} // Set the environment variable <var> to <val>; unset it if <var> is empty
IsolateOptions.prototype["extra-time"] = function (timeInSeconds) { this.args.push(`--extra-time=${timeInSeconds}`);return this;} // Set extra timeout, before which a timing-out program is not yet killed, so that its real execution time is reported (seconds, fractions allowed)
IsolateOptions.prototype["full-env"] = function () { this.args.push(`--full-env`);return this;}  // Inherit full environment of the parent process
IsolateOptions.prototype["inherit-fds"] = function () { this.args.push(`--inherit-fds`);return this;} // Inherit all file descriptors of the parent process
IsolateOptions.prototype["mem"] = function (sizeInKB) { this.args.push(`--mem=${sizeInKB}`);return this;} // Limit address space to <size> KB
IsolateOptions.prototype["meta"] = function (file) { this.args.push(`--meta=${file}`);return this;} // Output process information to <file> (name:value)
IsolateOptions.prototype["quota"] = function (blk, ino) { this.args.push(`--quota=${blk},${ino}`);return this;} // Set disk quota to <blk> blocks and <ino> inodes
IsolateOptions.prototype["share-net"] = function () { this.args.push(`--share-net`);return this;} //  // Share network namespace with the parent process
IsolateOptions.prototype["silent"] = function () { this.args.push(`--silent`);return this;} //  // Do not print status messages except for fatal errors
IsolateOptions.prototype["stack"] = function (sizeInKB) { this.args.push(`--stack=${sizeInKB}`);return this;} // Limit stack size to <size> KB (default: 0=unlimited)
IsolateOptions.prototype["stderr"] = function (file) { this.args.push(`--stderr=${file}`);return this;} // Redirect stderr to <file>
IsolateOptions.prototype["stderrToStdout"] = function () { this.args.push(`--stderr-to-stdout`);return this;} // Redirect stderr to stdout
IsolateOptions.prototype["stdin"] = function (file) { this.args.push(`--stdin=${file}`);return this;} // Redirect stdin from <file>
IsolateOptions.prototype["stdout"] = function (file) { this.args.push(`--stdout=${file}`);return this;} // Redirect stdout to <file>
IsolateOptions.prototype["processes"] = function (num) { this.args.push(`--processes=${num}`);return this;} // Enable multiple processes (at most <num> of them); needs --cg
IsolateOptions.prototype["timeLimit"] = function (timeInSeconds) { this.args.push(`--time=${timeInSeconds}`);return this;} // Set run time limit (seconds, fractions allowed)
IsolateOptions.prototype["verbose"] = function () { this.args.push(`--verbose`);return this;} //  // Be verbose (use multiple times for even more verbosity)
IsolateOptions.prototype["wall-time"] = function (timeInSeconds) { this.args.push(`--wall-time=${timeInSeconds}`);return this;} // Set wall clock time limit (seconds, fractions allowed)
IsolateOptions.prototype.digest = function () {return this.args};
IsolateOptions.prototype.toString = () => this.args.join(" ")
