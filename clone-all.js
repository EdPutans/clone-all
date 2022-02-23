import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { exit, stdin, stdout } from 'process';
import readline from 'readline';
import userNames from './people.js';

const io = readline.createInterface({ input: stdin, output: stdout });

const trueAnswers = ['y', 'yes', 'Y', 'Yes'];

const cleanFolder = (repoName, userName) => execSync(`cd ${repoName} && rm -rf ${userName} && mkdir ${userName}`);


const cloneForAll = async (repoName, shouldInstall, shouldPullInExistingFolders) => {
  // if folder doesn't exist, create it
  if (!existsSync(repoName)) {
    execSync(`mkdir ${repoName}`);
    console.log('Folder created');
  }

  const erroredUsernames = [];

  // loop over every person
  await userNames.forEach((userName) => {
    const localPath = `${repoName}/${userName}`;

    try {
      // if shouldPullInExistingFolders is true, delete the folder and create a new one
      if (existsSync(localPath)) {
        if (shouldPullInExistingFolders) {

          execSync(`cd ${repoName}/${userName} && git pull`)
          // console.log(`Cleaning ${localPath}...`);
          // cleanFolder(repoName, userName);
          // skip otherwise
        } else {
          console.log(`${userName} already cloned. Skipping...`);
          return;
        }
      }
      // clone the repo
      return execSync(`cd ${repoName} && git clone git@github.com:${userName}/${repoName}.git ${userName} ${shouldInstall ? `&& cd ./${userName} && npm install` : ''}`)

    } catch (e) {
      // add to errored usernames if wasn't able to clone
      erroredUsernames.push(userName);
    }
  });

  return { erroredUsernames };
}

// main
const init = async () => {
  if (!userNames.length) {
    console.error('No usernames provided!');
    exit(1);
  }
  // ask for repo name
  await io.question('Repo name: ', async (repoName) => {
    // ask for whether to override the existing clones
    await io.question('Should pull in existing folders? (y/n): ', async (pullInExisting) => {
      const shouldPullInExistingFolders = trueAnswers.includes(pullInExisting);

      // ask for whether to run NPM INSTALL on each project
      await io.question('Run npm install in each project? [y/n] ', async runInstall => {
        const shouldInstall = runInstall === 'y' || runInstall === 'yes' || runInstall === 'Y' || runInstall === 'Yes';

        // clone everybody's repos
        const { erroredUsernames } = await cloneForAll(repoName, shouldInstall, shouldPullInExistingFolders);

        // if there were any errors, print them
        if (erroredUsernames.length) {
          console.error(`Couldn't fetch the repo for ${erroredUsernames.join(', ')}. Removing their empty folders...`);

          // remove the empty folders and exit with an error
          erroredUsernames.forEach(userName => {
            execSync(`cd ${repoName} && rm -rf ${userName}`);
          })
          exit(1);

        } else {
          // surprise - surprise, everybody submitted their work!
          console.info(`No way, everybody submitted today!`);
          exit(0);
        }
      });
    })
  });
}

// run me
init();