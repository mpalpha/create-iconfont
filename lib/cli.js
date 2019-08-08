#!/usr/bin/env node

const args = process.argv;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main() {
  const { stdout, stderr } = await exec(
    `./node_modules/.bin/gulp ${args.slice(2).join(' ')}`
  );
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log(`Number of files ${stdout}`);
}

main();
