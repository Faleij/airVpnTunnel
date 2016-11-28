#! /usr/bin/env node

'use strict';

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const confPath = path.resolve(__dirname, '../config.json');
const defaultConfig = require(confPath);

inquirer.prompt([
    { type: 'confirm', name: 'proxy', message: 'Start VPN Proxy when VPN connection is made?', default: defaultConfig.proxy },
    { type: 'input', name: 'proxyPort', message: 'What port should the VPN Proxy listen on?', default: defaultConfig.proxyPort, when(answers) { return answers.proxy; }, validate(n) { return Number.isFinite(parseInt(n, 10)); } },
]).then(function (answers) {
  fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(answers, null, '  '));
  console.log('saved proxy config');
});
