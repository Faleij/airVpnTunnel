#! /usr/bin/env node

'use strict';

const inquirer = require('inquirer');
const fs = require('fs');

const path = require('path');
console.log(path.resolve(__dirname, '../config.json'));

inquirer.prompt([
    { type: 'confirm', name: 'proxy', message: 'Start VPN Proxy when VPN connection is made?', default: true },
    { type: 'input', name: 'proxyPort', message: 'What port should the VPN Proxy listen on?', default: 8080, when(answers) { return answers.proxy; }, validate(n) { return Number.isFinite(parseInt(n, 10)); } },
]).then(function (answers) {
    console.log('\nYou can run this config again with "airVpnTunnel"');
  fs.writeFileSync(path.resolve(__dirname, '../config.json'), JSON.stringify(answers, null, '  '));
});
