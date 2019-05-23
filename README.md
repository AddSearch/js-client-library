# AddSearch Search API Client for JavaScript

[AddSearch](https://www.addsearch.com) is a hosted search platform for all your web content. This API 
Client lets you easily use the [AddSearch Search API](https://www.addsearch.com/support/api-reference/) 
from your JavaScript code. This client works on web browsers and with Node.js.

## Quick Start
```js
// Create client with your 32-character SITEKEY
var client = new AddSearchClient('YOUR PUBLIC SITEKEY');

// Callback function
var cb = function(res) {
  // Print results to console
  console.log(res);
}

// Execute search. Callback function cb will be called with search results
client.search('keyword', cb);

// Get search suggestions for a keyword
client.suggest('api', cb);
```

## Publicly accessible functions

The client provides the following functions.

#### Fetch search results
```js
// Search with a specific keyword
client.search('keyword', callback);

// Search with the previously used keyword or execute a "match all" query
client.search(callback);
```

#### Define language filter (e.g. "en" or "de")
```js
client.setLanguage('en');
```

#### Manage paging
```js
// Defaults: page "1", pageSize "10", sortBy "relevance", sortOrder "desc"
client.setPaging(page, pageSize, sortBy, sortOrder);

// Next {pageSize} results
client.nextPage();

// Previous {pageSize} results
client.previousPage();
```

## Browser support
The client is tested on following browsers
- Chrome
- Firefox
- Edge
- Safari 6.1+
- Internet Explorer 10+

## Development
To modify this client library, clone this repository to your computer and execute following commands.
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