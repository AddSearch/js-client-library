'use strict';

import { polyfill } from 'es6-promise';
import { statsInstance } from './api';

polyfill();

type Payload = Record<string, unknown>;

const sendStats = (
  apiHostname: string,
  sitekey: string,
  payload: Payload,
  statsRequestIntercepted: boolean
): void => {
  // Beacon in browsers
  if (
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.sendBeacon &&
    !statsRequestIntercepted
  ) {
    window.navigator.sendBeacon(
      `https://${apiHostname}/v1/stats/${sitekey}/`,
      JSON.stringify(payload)
    );
  }
  // POST in node
  else {
    statsInstance
      .post(`https://${apiHostname}/v1/stats/${sitekey}/`, payload, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      .then()
      .catch((err) => {
        console.error(err);
      });
  }
};

export default sendStats;
