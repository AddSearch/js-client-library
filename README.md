# AddSearch Search API Client for JavaScript

[AddSearch](https://www.addsearch.com) is a hosted search platform for all your web content. This API 
Client lets you easily use the [AddSearch Search API](https://www.addsearch.com/support/api-reference/) 
from your JavaScript code on web browsers or with Node.js.

## Quick Start
The library is available on the global CDN [jsDelivr:](https://www.jsdelivr.com/)
```html
<script src="https://cdn.jsdelivr.net/npm/addsearch-js-client@0.1/dist/addsearch-js-client.min.js"></script>
```
To install the library locally or to use it with Node.js:
```sh
npm install addsearch-js-client --save
```

####Make the first search
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

#### Use fuzzy matching
```js
// Enable/disable fuzzy matching used in typo tolerance (default "true")
client.useFuzzyMatch(false);
```

#### Define language filter
```js
// Documents in specific language (e.g. "en" or "de")
client.setLanguage('en');
```

#### Define publishing date filters 
```js
// Documents published between specific date range
client.setDateFilter('2019-01-01', '2019-01-31');
```

#### Define category filters 
Filter by URL patterns, document types or *addsearch-category* meta tag values.
See the [full documentation.](https://www.addsearch.com/support/documentation/ranking-relevance-filters/filters/#category-filters)

```js
// Only PDF files or products
client.setCategoryFilters('doctype_pdf,products');
```

#### Custom field filters
Filter by custom fields. Custon fields can be defined in meta tags or AddSearch crawler can pick them up from your HTML or JSON data.
See the [full documentation.](https://www.addsearch.com/support/documentation/ranking-relevance-filters/custom-field/)

```js
// Search by specific city (Berlin, Paris or Boston)
client.addCustomFieldFilter('city','berlin');
client.addCustomFieldFilter('city','paris');
client.addCustomFieldFilter('city','boston');

// Remove Paris (Berlin and Boston remaining)
client.removeCustomFieldFilter('city','paris');

// Remove all cities
client.removeCustomFieldFilter('city');
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

## Supported web browsers and node.js versions
The client is tested on
- Chrome
- Firefox
- Edge
- Safari 6.1+
- Internet Explorer 10+
- Node.js 4+


## Development
To modify this client library, clone this repository to your computer and execute following commands.
#### Install dependencies
```sh
npm install
```

#### Run tests
```sh
npm test
```

#### Build
```sh
npm run build
```

Built bundle is saved under the *dist/* folder

## Support

Feel free to semd any questions, ideas and suggestions at [support@addsearch.com](support@addsearch.com).