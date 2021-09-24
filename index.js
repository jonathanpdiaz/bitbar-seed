#!/usr/bin/env /usr/local/bin/node
const { execSync } = require("child_process");
const bitbar = require('bitbar');
const dotenv = require("dotenv");
const fs = require('fs');

const ENV_FILE_NAME = ".env.bitbar-seed";
let envFile;
if (fs.existsSync(`./${ENV_FILE_NAME}`)) {
  envFile = fs.readFileSync(`./${ENV_FILE_NAME}`);
} else {
  const response = execSync(
    "defaults read com.matryer.BitBar pluginsDirectory"
  );
  const envPath = `${response.toString().trim()}/${ENV_FILE_NAME}`;
  envFile = fs.readFileSync(envPath);
}

const envConfig = dotenv.parse(envFile);
for (let k in envConfig) {
  process.env[k] = envConfig[k];
}

const { issues } = require("./auth");

const cleanUpName = name => {
  return name.toString().toLowerCase()
    .replace(/api/g, '')
    .replace(/prod/g, '')
    .replace(/staging/g, '')
    .replace(/boss/g, '')
    .replace(/dev/g, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/\-+/g, ' ')
    .replace(/\s+/g, '-');
}

function groupBy(arr, property) {

  arr = arr.filter(issue => issue.errorMessage.indexOf('timed out') < 0);

  const reduced = arr.reduce((acc, cur) => {
    acc[cur[property]] = [...acc[cur[property]] || [], cur];
    return acc;
  }, {});

  return Object.keys(reduced).map(lambda => {
    return {
      text: `${reduced[lambda].length} - ${cleanUpName(lambda)}`,
      total: reduced[lambda].length,
      submenu: reduced[lambda].map(issue => {
        return {
          text: `${issue.lastErrorShortId} - ${issue.errorMessage}`,
          href: `https://console.seed.run/${process.env.APP}/issues/stages/${issue.stageId}/${issue.errorGroupShortId}/${issue.lastErrorShortId}`
        }
      })
    };
  }).sort((a, b) => b.total - a.total);
}

async function getData() {
  
  const apps = JSON.parse(process.env.APPS);
  const users = JSON.parse(process.env.USERS);
  const passwords = JSON.parse(process.env.PASSWORDS);
  
  let prodTotals = [];
  let appsMenu = [];

  for (let index = 0; index < apps.length; index++) {
    const app = apps[index];
    const user = users[index];
    const password = passwords[index];

    const [dev, stage, prod] = await issues(app, user, password);

    const devGroup = groupBy(dev.errorGroups, 'lastLambdaName');
    const stageGroup = groupBy(stage.errorGroups, 'lastLambdaName');
    const prodGroup = groupBy(prod.errorGroups, 'lastLambdaName');

    const sumIssues = (total, issues) => total + issues.total;
    const devTotalApp = devGroup.reduce(sumIssues, 0);
    const stageTotalApp = stageGroup.reduce(sumIssues, 0);
    const prodTotalApp = prodGroup.reduce(sumIssues, 0);
    prodTotals.push(prodTotalApp);

    const submenu = [   
      {
      text: 'Development'
      },
      ...devGroup,
      bitbar.separator,
      {
        text: 'Staging'
      },
      ...stageGroup,
      bitbar.separator,
      {
        text: 'Production'
      },
      ...prodGroup
    ];
  
    const appMenu =  {
      text: `${app} - D:${devTotalApp} S:${stageTotalApp} P:${prodTotalApp}`,
      color: "red"
    };

    appsMenu.push(appMenu);
    appsMenu.push(...submenu);
    appsMenu.push(bitbar.separator);
  }

  const prodIssues = prodTotals.map(prodTotal => `P:${prodTotal}`);
  const navText = `🌱 ${prodIssues.join(' - ')}`; 

  bitbar([
    {
      text: navText
    },
    bitbar.separator,
    ...appsMenu,
    bitbar.separator,
    {
      text: "♻︎",
      refresh: true,
    }
  ]);
}

getData()