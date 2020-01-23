# AddSearch Search API Client for JavaScript

[AddSearch](https://www.addsearch.com) is a hosted search platform for all your web content. This API 
Client lets you easily use the [AddSearch Search API](https://www.addsearch.com/support/api-reference/) 
from your JavaScript code on web browsers or with Node.js.

## Quick Start
The library is available on the global CDN [jsDelivr:](https://www.jsdelivr.com/)
```html
<script src="https://cdn.jsdelivr.net/npm/addsearch-js-client@0.2/dist/addsearch-js-client.min.js"></script>
```
To install the library locally or to use it with Node.js:
```sh
npm install addsearch-js-client --save
```

After installation, add the library to your JS code

```js
var AddSearchClient = require('addsearch-js-client');
```

Or use import in ES6
```js
import AddSearchClient from 'addsearch-js-client';
```

#### Execute the first search query
```js
// Create client with your 32-character SITEKEY
var client = new AddSearchClient('YOUR PUBLIC SITEKEY');

// Callback function
var cb = function(res) {
  // Print results to console
  console.log(res);
}

// Execute search. Callback function will be called with search results
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

// Search with the previously used keyword and callback (e.g. after modifying filters)
client.search();
```

#### Fetch search suggestions
```js
// Configure Search suggestions on AddSearch Dashboard first
// Get suggestions starting with a specific prefix
client.suggestions('a', callback);
```

#### Number of search suggestions
```js
// Number of search suggestions to fetch (default 10)
client.setSuggestionsSize(20);
```

#### Search with fuzzy matching
```js
// Enable/disable fuzzy matching. Possible values true/false/"auto" (default: "auto")
client.setFuzzyMatch(false);
```

#### Collect analytics
```js
// Control whether search queries are sent to your AddSearch Analytics Dashboard or not (default: true)
client.setCollectAnalytics(false);
```

#### Send click event to analytics
When a search results is clicked, send the event to your AddSearch Analytics Dashboard. Information on clicks is used
in your statistics and in the self-learning search algorithm.
```js
// Docid is the 32-character long identifier in each hit returned by the search. 
// Position is the position of the document that was clicked, the first result being 1
client.searchResultClicked(docid, position);
```

#### Set JSON Web Token (for authentication)
```js
// Add JWT to the search request (if protected search index)
client.setJWT(token);
```

#### Set user token (for personalized search results)
```js
// Add a user token to the search request (if personalization in use)
client.setUserToken('uuid');
```

#### Send personalization events with search query
In personalized search, user events are typically sent to AddSearch via API and a user token
is passed with the search query (see setUserToken function). 
An alternative way is to send user events needed for personalization with the search query.

```js
// Events depend on the personalization strategy
// Contact AddSearch for more information
var events = [
  {favorite_genre: 'rock'},
  {favorite_band: 'Red Hot Chili Peppers'},
  {least_favorite_genre: 'country'}
];

client.setPersonalizationEvents(events);
```

#### Define language filter
```js
// Documents in specific language (e.g. "en" or "de")
client.setLanguage('en');
```

#### Define publishing date filter 
```js
// Documents published between specific date range
client.setDateFilter('2019-01-01', '2019-01-31');
```

#### Define price range filter
```js
// Products in specific price range (in cents. e.g. 100,00 - 200,00)
client.setPriceRangeFilter('10000', '20000');
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
Set page number, page size and sorting parameters. It's possible to order results by:
- relevance (descending)
- date (ascending or descending)
- custom field value (ascending or descending. E.g. *custom_fields.price*)
```js
// Defaults: page "1", pageSize "10", sortBy "relevance", sortOrder "desc"
client.setPaging(page, pageSize, sortBy, sortOrder);
```

Other functions.

```js
// Next page (call search function to fetch results)
client.nextPage();

// Previous page
client.previousPage();
```

#### Set result type
```js
// By default, fetch all search results
// If "organic", Pinned results and Promotions are left out
client.setResultType('organic');
```

#### Facets
```js
// Declare fields for faceting. Number of hits found from
// these fields will be returned
client.addFacetField('category');
client.addFacetField('custom_fields.genre');
```
By default, 10 facets with most hits are returned per field. 
Use the following function to get more or less facets.
```js
client.setNumberOfFacets(20);
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
Feel free to send any questions, ideas, and suggestions at [support@addsearch.com](mailto:support@addsearch.com) or 
visit [addsearch.com](https://www.addsearch.com/) for more information.