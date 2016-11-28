'use strict';

const { execSync, spawn } = require( 'child_process' );
const network = require('network');
const fs = require('fs');
const path = require('path');

console.log(path.resolve(__dirname, '../tmp/physical.json'));

network.get_active_interface(function(err, obj) {
    fs.writeFileSync(path.resolve(__dirname, '../tmp/physical.json'), JSON.stringify(obj));
    process.exit();
});
