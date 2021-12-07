import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { exit, stdin, stdout } from 'process';
import readline from 'readline';

const io = readline.createInterface({ input: stdin, output: stdout });

const truthyUserInput = ['y', 'yes', 'Y', 'Yes'];

const userNames = [
  // hehe nope.
  // copy the github usernames over from the spreadsheet here.
  // just make a list of strings 
];

const cleanFolder = (repoName, userName) => execSync(`cd ${repoName} && rm -rf ${userName} && mkdir ${userName}`);


// returms an object with the errored usernames.
const cloneForAll = async (repoName, shouldInstall, shouldOverrideExistingFolders) => {
  // if folder doesn't exist, create it
  if (!existsSync(repoName)) execSync(`mkdir ${repoName}`);
  

  const erroredUsernames = [];

  // loop over every person
  await userNames.forEach((userName) => {
    const localPath = `${repoName}/${userName}`;

    try {
      // if shouldOverrideExistingFolders is true, delete the folder and create a new one
      if (existsSync(localPath)) {
        if (shouldOverrideExistingFolders) {
          console.log(`Cleaning ${localPath}...`);
          cleanFolder(repoName, userName);
        } else {
          // skip otherwise
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
    await io.question('Should override existing folders? (y/n): ', async (overrideExisting) => {
      const shouldOverrideExistingFolders = truthyUserInput.includes(overrideExisting);

      // ask for whether to run NPM INSTALL on each project
      await io.question('Run npm install in each project? [y/n] ', async runInstall => {
        const shouldInstall = truthyUserInput.includes(runInstall);

        // clone everybody's repos and get the errored names
        const { erroredUsernames } = await cloneForAll(repoName, shouldInstall, shouldOverrideExistingFolders);

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

// so run me baby
init();