#! /usr/bin/env node

'use strict';

var program = require('commander');

program
  .command('install', 'Install hooks and patch AirVPN config and config proxy', 'i')
  .command('config', 'Configure AirVPN tunnel proxy', 'c')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
