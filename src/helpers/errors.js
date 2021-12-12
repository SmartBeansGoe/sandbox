export const unsupportedTestType = (lang, testtype) => ({
    status: 501,
    message: `Language ${lang} supported but test type ${testtype} is not supported`
});
export const unsupportedLanguage = (lang) => ({
    status: 501,
    message: `Language ${lang} not supported`
});
export const unsupportedMode = (msg) => ({
    status: 501,
    message: `Mode ${msg.mode} not supported`
});
export const notImplemented = () => ({
    status: 401,
    message: `The stupid developer was lazy and didn't do his work here ;-) (yet)`
});