const execa = require("execa");

// soft string comparison
const sanitizeSimple = (str) => str
    .replace(/[ \t]+/g, " ")
    .replace(/ +/g, " ")
    .replace(/ *\n */g, "\n")
    .trim(); // unify whitespaces, cut trailing whitespaces

module.exports = {

    // file system commands
    mkdir: (dir) => execa.command(`mkdir "${dir}"`, {shell: true}),
    cp: (from, to) => execa.command(`cp -R ${from} ${to}`, {shell: true}),
    rmrf: (path) => execa.command(`rm -rf ${path}/*`, {shell: true}), // TODO dup in sandbox.js

    diff: (str1, str2) => (sanitizeSimple(str1) !== sanitizeSimple(str2)),

    // other
    generateID: () => Math.floor(Math.random() * Math.pow(26, 10)).toString(26),
};
