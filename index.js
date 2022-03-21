#!/usr/bin/env /usr/local/bin/node
const bitbar = require('bitbar');
const fs = require('fs');
const settings = require('./env.bitbar-seed.json')

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

function groupBy(app, arr, property) {

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
          href: `https://console.seed.run/${app}/issues/stages/${issue.stageId}/${issue.errorGroupShortId}/${issue.lastErrorShortId}`
        }
      })
    };
  }).sort((a, b) => b.total - a.total);
}

async function getData() {
  const { cognito, apps } = settings;

  const sumIssues = (total, issues) => total + issues.total;
  const isProd = (stageName) => stageName === "prod" || stageName === "production";

  let appsMenu = [];
  let prodTotals = [];

  for (let index = 0; index < apps.length; index++) {
    const appItem = apps[index];
    const { app } = appItem;

    const issuesPerEnv = await issues(appItem);
    let subMenu = [];
    let groupTotals = [];

    for (let j = 0; j < issuesPerEnv.length; j++) {
      const issues = issuesPerEnv[j];
      const { stageName, errorGroups } = issues
      const group = groupBy(app, errorGroups, 'lastLambdaName');
      const groupTotal = group.reduce(sumIssues, 0);
      groupTotals.push(`${stageName.charAt(0).toUpperCase()}:${groupTotal}`);

      if (isProd(stageName)) {
        prodTotals.push(groupTotal);
      }

      subMenu.push({ text: stageName });
      subMenu.push(...group);
      if (j < issuesPerEnv.length) {
        subMenu.push(bitbar.separator);
      }
    }

    const appMenu = {
      text: `${app} - ${groupTotals.join(" ")}`,
      color: "red"
    };

    appsMenu.push(appMenu);
    appsMenu.push(...subMenu);
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