'use strict';

const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const { gateway_ip, model } = require(path.resolve(__dirname, '../tmp/physical.json'));
const network = require('network');
const config = require(path.resolve(__dirname, '../config.json'));
let getCmd;

// we could add websites ip as vpn-using routes but doing it with a proxy is much easier and user friendly (see foxy proxy)
// windows specific command, requires elevated privlege - which AirVPN gives us
getCmd = destination => `route add ${destination} mask 192.0.0.0 ${gateway_ip}`;

const destinations = [
    '0.0.0.0',
    '64.0.0.0',
    '128.0.0.0',
    '192.0.0.0',
];

// restore routes
destinations.forEach(destination => execSync(getCmd(destination)));

if (config.proxy) {
    network.get_active_interface(function(err, {ip_address}) {
        if (err) throw err;

        const proxyLog = fs.openSync(path.resolve(__dirname, '../tmp/proxy.log'), 'a');

        // spawn detached proxy with forwarded arguments
        const proxyPath = path.resolve(__dirname, '../node_modules/proxy/bin/proxy');
        const proxy = spawn(process.argv[0], [proxyPath, `-l`, `${ip_address}`].concat(process.argv.slice(1)).concat(`-p`, `${config.proxyPort}`), {
          detached: true,
          //stdio: 'ignore'
          // TODO: pipe stdio to a log file
          stdio: ['ignore', proxyLog, proxyLog],
        });

        // TODO: log file output
        console.log(`Spawned child pid: ${proxy.pid}`);

        fs.writeFileSync(path.resolve(__dirname, '../tmp/proxy.pid'), proxy.pid);

        process.exit();
});
}
