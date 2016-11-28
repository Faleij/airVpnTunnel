'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).some(function (ifname) {
  return ifaces[ifname].some(function ({ mac, address: ip}) {
    if (mac === '00:ff:88:65:ba:78') {
	console.log(ip);
      process.argv.push(`-l`);
	  process.argv.push(`${ip}`);
    }
  });
});

require('proxy/bin/proxy');
