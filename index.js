#!/usr/bin/env node

const args = process.argv;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main() {
  process.chdir(__dirname);
  const { stdout, stderr } = await exec(
    `npx --ignore-existing gulp@^4.0.2 ${args.slice(2).join(' ')}`
  );
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log(`Number of files ${stdout}`);
}

main();
