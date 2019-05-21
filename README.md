# AddSearch Search API Client for JavaScript

[AddSearch](https://www.addsearch.com) is a hosted search platform for all your web content. This API 
Client lets you easily use the [AddSearch Search API](https://www.addsearch.com/support/api-reference/) 
from your JavaScript code. This client works on web browsers and with Node.js.

## Quick Start
```js
var cb = function(res) {
  console.log(res);
}

// Create client with your 32-character SITEKEY
var client = new AddSearchClient('YOUR PUBLIC SITEKEY');
// Execute search. Callback function cb will be called with search results
client.search('keyword', cb);
```

## How to develop
### Install dependencies
```sh
npm install
```

### Run tests
```sh
npm test
```

### Build
To build the client, run:

```sh
npm run build
```

Built bundle is saved under the *dist/* folder