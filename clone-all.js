import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { exit } from 'process';
import  readline  from 'readline';

const userNames = [
    // hehe nope.
    // copy the names over from the spreadsheet...
    "3mper0r",
    "artioladomicaka",
    "visard123",
    "adrianorama",
    "denis-projects",
    "nilsondyrmishi",
    "marselsotiri",
    "agnesas",
    "egon92",
    "gr3g03",
    "desintila",
    "endiymeri",
    "marvinroot",
    "besim10",
    "ilir2523",
    "ramarinor",
    "aritaosmani",
    "Avenger22",
    "geri1997"
];

const cleanFolder = (repoName, userName) => execSync(`cd ${repoName} && \
rm -rf ${userName} && \
mkdir ${userName}`);

const io = readline.createInterface({ input: process.stdin, output: process.stdout });

const erroredUsernames = [];

const cloneForAll = (repoName, shouldInstall, shouldOverrideExistingFolders) => {
    if(!existsSync(repoName)){
        execSync(`mkdir ${repoName}`);
        console.log('Folder created');
    }

     userNames.forEach( (userName) => {
        const localPath = `${repoName}/${userName}`;

        try {
            if(existsSync(localPath)) {
                if(shouldOverrideExistingFolders) {
                    cleanFolder(repoName, userName);
                } else {
                    console.log(`${userName} already cloned. Skipping...`);
                    return;
                }
            }

            return execSync(`
                cd ${repoName} && \
                git clone git@github.com:${userName}/${repoName}.git ${userName} \
                ${shouldInstall ? `&& cd ${userName} && npm install` : ''}
            `);
        } catch {
            execSync(`cd ${repoName} && rm -rf ${repoName}`);
            erroredUsernames.push(userName);
        }
    });

    return true;
}

 await io.question('Repo name: ', async (repoName) => {
     await io.question('Should override existing folders? (y/n): ', async (overrideExisting) => {
        const shouldOverrideExistingFolders = overrideExisting === 'y' || overrideExisting === 'yes' || overrideExisting === 'Y' || overrideExisting === 'Yes';

        await io.question('Run npm install? [y/n] ', async runInstall => {
            const shouldInstall = runInstall === 'y' || runInstall === 'yes' || runInstall === 'Y' || runInstall === 'Yes';

            cloneForAll(repoName, shouldInstall, shouldOverrideExistingFolders);

            if(erroredUsernames.length){
                console.error(`Couldn't fetch the repo for ${erroredUsernames.join(', ')}. Clearing folders...`);
                erroredUsernames.forEach(userName => {
                   execSync(`cd ${repoName} && rm -rf ${userName}`);
                })
                exit(1);
            } else {
                console.info(`No way, everybody submitted today!`);
                exit(0)
            }
        });
     })
 });


