import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { exit } from 'process';
import readline from 'readline';

const io = readline.createInterface({ input: process.stdin, output: process.stdout });

const userNames = [
  // hehe nope.
  // copy the github usernames over from the spreadsheet here.
  // just make a list of strings 
];

const cleanFolder = (repoName, userName) => execSync(`cd ${repoName} && \
rm -rf ${userName} && \
mkdir ${userName}`);

const erroredUsernames = [];

const cloneForAll = (repoName, shouldInstall, shouldOverrideExistingFolders) => {
  // if folder doesn't exist, create it
  if (!existsSync(repoName)) {
    execSync(`mkdir ${repoName}`);
    console.log('Folder created');
  }

  // loop over every person
  userNames.forEach((userName) => {
    const localPath = `${repoName}/${userName}`;

    try {
      // if shouldOverrideExistingFolders is true, delete the folder and create a new one
      if (existsSync(localPath)) {
        if (shouldOverrideExistingFolders) {
          console.log(`Cleaning ${localPath}...`);
          cleanFolder(repoName, userName);
          // skip otherwise
        } else {
          console.log(`${userName} already cloned. Skipping...`);
          return;
        }
      }

      // clone the repo
      return execSync(`
            cd ${repoName} && \
            git clone git@github.com:${userName}/${repoName}.git ${userName} \
            ${shouldInstall ? `&& cd ${userName} && npm install` : ''}
        `);
    } catch {
      execSync(`cd ${repoName} && rm -rf ${repoName}`);
      // add to errored usernames if wasn't able to clone
      erroredUsernames.push(userName);
    }
  });

  return true;
}

// main
const init = async () => {
  // ask for repo name
  await io.question('Repo name: ', async (repoName) => {
    // ask for whether to override the existing clones
    await io.question('Should override existing folders? (y/n): ', async (overrideExisting) => {
      const shouldOverrideExistingFolders = overrideExisting === 'y' || overrideExisting === 'yes' || overrideExisting === 'Y' || overrideExisting === 'Yes';

      // ask for whether to run NPM INSTALL on each project
      await io.question('Run npm install? [y/n] ', async runInstall => {
        const shouldInstall = runInstall === 'y' || runInstall === 'yes' || runInstall === 'Y' || runInstall === 'Yes';

        // clone everybody's repos
        cloneForAll(repoName, shouldInstall, shouldOverrideExistingFolders);

        // if there were any errors, print them
        if (erroredUsernames.length) {
          console.error(`Couldn't fetch the repo for ${erroredUsernames.join(', ')}. Removing their empty folders...`);

          erroredUsernames.forEach(userName => {
            // remove the empty folders
            execSync(`cd ${repoName} && rm -rf ${userName}`);
          })
          exit(1);

        } else {
          // surprise - surprise, everybody submitted their work!
          console.info(`No way, everybody submitted today!`);
          exit(0)
        }
      });
    })
  });
}

// run me
init();