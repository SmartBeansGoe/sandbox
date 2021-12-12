/*
the maximum number of containers is usually fixed for a reason:
- isolate only supports up to 100 containers
- there is no good reason to have less since this is the bottleneck for evaluation speed
- 100 is reasonable
 */
export const NUMBER_OF_CONTAINERS = 100;
export const SUBMISSIONS_DIR = '/submissions';
export const port = 3000;