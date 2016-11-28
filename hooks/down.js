'use strict';

const fs = require('fs');
const path = require('path');

process.kill(parseInt(fs.readFileSync(path.resolve(__dirname, '../tmp/proxy.pid')), 10));
