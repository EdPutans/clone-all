import { execSync } from 'child_process';
import { exit, stdin, stdout } from 'process';
import readline from 'readline';

const io = readline.createInterface({ input: stdin, output: stdout });

async function cloneSingle(shouldInstall = true) {
  await io.question('Github username: ', async (userName) => {
    // ask for whether to override the existing clones
    await io.question('Repository: ', async (repoName) => {
      // clone the repo
      try {
        execSync(`cd ${repoName} && git clone git@github.com:${userName}/${repoName}.git ${userName} ${shouldInstall ? `&& cd ./${userName} && npm install` : ''}`)
        exit(0)
      }
      catch (e) {
        console.error(e);
        exit(1);
      }
    })
  })
}

cloneSingle();