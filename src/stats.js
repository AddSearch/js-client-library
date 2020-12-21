'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

var sendStats = function(apiHostname, sitekey, data) {

  // Beacon in browsers
  if (typeof window !== 'undefined' && window.navigator && window.navigator.sendBeacon) {
    navigator.sendBeacon('https://' + apiHostname + '/v1/stats/' + sitekey + '/', JSON.stringify(data));
  }

  // POST in node
  else {
    fetch('https://' + apiHostname + '/v1/stats/' + sitekey + '/', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
    });
  }
};

module.exports = sendStats;