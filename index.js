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
  const [dev, stage, prod] = await issues();

  const devGroup = groupBy(dev.errorGroups, 'lastLambdaName');
  const stageGroup = groupBy(stage.errorGroups, 'lastLambdaName');
  const prodGroup = groupBy(prod.errorGroups, 'lastLambdaName');

  const sumIssues = (total, issues) => total + issues.total;
  const devTotal = devGroup.reduce(sumIssues, 0);
  const stageTotal = stageGroup.reduce(sumIssues, 0);
  const prodTotal = prodGroup.reduce(sumIssues, 0);

  bitbar([
    {
      text: `🌱 D:${devTotal} S:${stageTotal} P:${prodTotal}`
    },
    bitbar.separator,
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
    ...prodGroup,
    bitbar.separator,
    {
      text: "♻︎",
      refresh: true,
    }
  ]);
}

getData()