#! /usr/bin/env node

'use strict';

const inquirer = require('inquirer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const tasklist = require('tasklist');
const taskkill = require('taskkill');

function closeAirVPN() {
    return tasklist()
    .then(data => data.find(v => v.imageName === 'AirVPN.exe'))
    .then(airVPN => {
        if (airVPN) {
            return inquirer.prompt([
                { type: 'confirm', name: 'close', message: 'Your AirVPN client seem to be running, do you want me to try and close it?', default: true },
            ]).then(function (answers) {
                if(answers.close) {
                    return taskkill(airVPN.pid)
                    .then(() => console.log(`Successfully closed AirVPN`))
                    .catch((err) =>
                        inquirer.prompt([
                            { type: 'confirm', name: 'tryAgain', message: `We could not close your AirVPN client, please terminate the process manually. Do you want to continue?` },
                        ])
                        .then((answers) => answers.tryAgain ? closeAirVPN() : process.exit(), err => console.log(err))
                    );
                }
            });
        }
    });
}

closeAirVPN().then(() => {
    const filePath = path.resolve(process.env.LOCALAPPDATA, 'AirVPN', 'AirVPN.xml');
    let data;
    let airVPN
    try {
        data = fs.readFileSync(filePath);
        airVPN = cheerio.load(data, { xmlMode: true, decodeEntities: false });
    } catch(err) {
        console.log(err);
        console.log('There was an error reading your AirVPN configuration.');
        console.log('If you have not run the AirVPN client yet you need to do that before installing this.');
        console.log('You can run "airVpnTunnel install" to try again.');
        process.exit();
    }

    // save backup of original
    const bacPath = `${filePath}.${new Date().toISOString().replace(/[:\+]+/g, '_')}.bac`;
    fs.writeFileSync(bacPath, airVPN.xml());
    console.log('I have saved a copy of your airVPN config to', bacPath);

    const optionsElement = airVPN('airvpn>options');

    const overrideOptions = new Map();
    overrideOptions.set('advanced.check.route', 'False');
    overrideOptions.set('dns.check', 'False');
    overrideOptions.set('routes.remove_default', 'False');
    overrideOptions.set('netlock.mode', 'none');

    const overrideEventOptions = new Map();
    overrideEventOptions.set('filename', () => 'node');
    overrideEventOptions.set('arguments', event => path.resolve(__dirname, '..', 'hooks', `${event}.js`));

    // copy event options to overrideOptions
    const events = fs.readdirSync(path.resolve(__dirname, '..', 'hooks')).map(file => file.replace('.js', ''));
    events.forEach(event => overrideEventOptions.forEach((factory, attr) => overrideOptions.set(`event.vpn.${event}.${attr}`, factory(event))));

    function setOption(value, name) {
        let option = optionsElement.find(`option[name="${name}"]`);
        if (!option.length) {
            // create option if it does not exist
            let appended = optionsElement.append(`    <option name="${name}">`, '\n');
            option = optionsElement.find(`option[name="${name}"]`);
        }

        option.attr('value', value);
    }

    overrideOptions.forEach(setOption);

    // overwrite file
    fs.writeFileSync(filePath, airVPN.xml());

    console.log('your AirVPN config has been modified');
    console.log(`
    Now you need to configure your torrent client to use the VPN interface and add your client to your firewall.
    For Tixati:
        Go to "Settings > Network > Connections" and change:
        "Network Mode" to "IPv4 only"
        "Local Ipv4 address..." to "TAP-Windows Adapter V9"
        "Local Ipv6 address..." to "TAP-Windows Adapter V9" or "Software loopback interface"
    Any other client: Google it.

    Firewall (windows built in firewall or any other firewall);
    Block Outbound and Inbound connections on 192.168.0.0/24 (or whatever your localnetwork address scope is) for your torrent client, and block edge traversals.
    `);

    return require('./airVpnTunnel-config');

    console.log('\nYou can run this setup again with "airVpnTunnel install",');
    console.log('\nor you can run the proxy config again with "airVpnTunnel config"');
});
