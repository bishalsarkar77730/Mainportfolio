const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runCommand(command) {
  try {
    const { stdout, stderr } = await exec(command);
    return stdout.trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

async function main() {
  const gitAdd = 'git add .';
  const commitMessage = await new Promise((resolve) => {
    rl.question('Enter your commit message: ', resolve);
  });
  const gitCommit = `git commit -m "${commitMessage}"`;
  const gitPush = 'git push origin main';

  await runCommand(gitAdd);
  await runCommand(gitCommit);

  const pushOutput = await runCommand(gitPush);
  console.log(pushOutput);

  const gitUsername = await new Promise((resolve) => {
    rl.question('Enter your Name: ', resolve);
  });

  const currentDatetime = new Date();
  const currentDate = currentDatetime.toISOString().split('T')[0];
  const currentTime = currentDatetime.toLocaleTimeString();
  const commitId = await runCommand('git rev-parse HEAD');

  const { stdout: gitOrigin } = await runCommand('git config --get remote.origin.url');
  const { stdout: gitBranch } = await runCommand('git branch --show-current');

  const entry = {
    name: gitUsername,
    commit: commitMessage,
    date: currentDate,
    time: currentTime,
    commitId: commitId,
    origin: gitOrigin?.trim(),
    branch: gitBranch?.trim(),
  };

  console.log(entry)
  let data = [];

  const reportFile = 'report.json';

  if (fs.existsSync(reportFile) && fs.statSync(reportFile).size > 0) {
    data = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
  }

  data.push(entry);

  fs.writeFileSync(reportFile, JSON.stringify(data, null, 4));

  const reportCsvFile = 'report.csv';

  const header = ['name', 'commit', 'date', 'time', 'commitId', 'origin', 'branch'];

  if (!fs.existsSync(reportCsvFile) || fs.statSync(reportCsvFile).size === 0) {
    fs.writeFileSync(reportCsvFile, header.join(',') + '\n');
  }

  const csvEntry = header.map((field) => entry[field]).join(',');
  fs.appendFileSync(reportCsvFile, csvEntry + '\n');

  console.log('Code pushed successfully and report updated.');

  rl.close();
}

main();
