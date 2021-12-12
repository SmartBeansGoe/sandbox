# Coding Sandbox
## Tech Stack

- docker, mainly for a unified and compact runtime environment that scales easily
- node.js with express.js as web server for job management
- [isolate](https://github.com/ioi/isolate) for sandboxing

## How to run
### Docker
The commands to do this are in [run.sh](./run.sh).
## local instance
Requirements:

- `node.js`, version >= 16
- `git`
- for c:
  - `make gcc clang libcunit1 libcunit1-dev`
  - https://github.com/ioi/isolate.git
- for python:
  - some `python3`

The Dockerfile contains all instructions for a debian based installation.

## Usage
The container listens (on port 3000). It expects POST-requests on `/evaluate` with a JSON body that respect the format specified as `evaluateInputSchema` in [src/helpers/schemas.js](src/helpers/schemas.js). It produces outputs that respect `evaluateOutputSchema`.

## Notes
- the Docker container must (ironically) be started with elevated privileges (`priviledged`) for the security mechanisms of `isolate` to work (e.g. control groups)
- the Docker container sometimes seems not to want to respond to `SIGINT`. However, `docker stop` always does.
- `isolate` allows a maximum of 999 environments at a time. For their management a semaphore is used
- `isolate` is very restrictive by default. If something does not work, this is a good starting point. Examples: multiple processes, RAM, access to other programs/devices