'use strict';

require('es6-promise').polyfill();
const statsInstance = require('./api').statsInstance;

var sendStats = function(apiHostname, sitekey, payload, statsRequestIntercepted) {

  // Beacon in browsers
  if (typeof window !== 'undefined' && window.navigator && window.navigator.sendBeacon && !statsRequestIntercepted) {
    navigator.sendBeacon('https://' + apiHostname + '/v1/stats/' + sitekey + '/', JSON.stringify(payload));
  }

  // POST in node
  else {
    statsInstance.post('https://' + apiHostname + '/v1/stats/' + sitekey + '/', payload, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
};

module.exports = sendStats;
