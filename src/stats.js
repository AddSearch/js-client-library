'use strict';

import 'es6-promise/auto';
import axios from 'axios';

var sendStats = function(apiHostname, sitekey, payload) {

  // Beacon in browsers
  if (typeof window !== 'undefined' && window.navigator && window.navigator.sendBeacon) {
    navigator.sendBeacon('https://' + apiHostname + '/v1/stats/' + sitekey + '/', JSON.stringify(payload));
  }

  // POST in node
  else {
    axios.post('https://' + apiHostname + '/v1/stats/' + sitekey + '/', payload, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
};

export default sendStats;