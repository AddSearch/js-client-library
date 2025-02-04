# AddSearch Search API Client for JavaScript

[AddSearch](https://www.addsearch.com) is a Search-as-a-Service for all your search needs. This API
Client lets you easily use the [Search API](https://www.addsearch.com/docs/api/) and
[Indexing API](https://www.addsearch.com/docs/api/indexing-overview/) with JavaScript.

## Quick Start

The library is available on the global CDN
[jsDelivr:](https://www.jsdelivr.com/package/npm/addsearch-js-client)

```html
<script src="https://cdn.jsdelivr.net/npm/addsearch-js-client@0.6/dist/addsearch-js-client.min.js"></script>
```

Or install the library locally to use it with Node.js:

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
var cb = function (res) {
  // Print results to console
  console.log(res);
};

// Execute search. Callback function will be called with search results
client.search('keyword', cb);
```

## Search API

The client provides following functions to execute search queries. To use the client library for
indexing, see [Indexing API](https://github.com/AddSearch/js-client-library#indexing-api).

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

Search suggestions are keywords and search phrases that real users have used in your search.
Configure Search suggestions on AddSearch Dashboard before using this function.

```js
// Get suggestions starting with a specific prefix
client.suggestions('a', callback);
```

#### Set the number of search suggestions to fetch

```js
// Number of search suggestions to fetch (default 10)
client.setSuggestionsSize(20);
```

#### Custom field autocompletion

Custom fields autocomplete can be used for predictive search. For example, product names or
categories can be suggested as the keyword is being typed in.

```js
// Fetch custom field values starting with a specific prefix In this example, fetch records
// starting with *a* from the *custom_fields.brand* field. Results could be "adidas, apple, azure"
client.autocomplete('custom_fields.brand', 'a', callback);
```

#### Set the number of custom field autocompletion results to fetch

```js
// Number of autocompletion results to fetch (default 10)
client.setAutocompleteSize(20);
```

#### Search with fuzzy matching

Fuzzy matching is used for typo tolerance. There are four options:

- **false**: No typo tolerance
- **true**: Exact matches and fuzzy matches are equal
- **"auto"**: Exact matches first, followed by fuzzy matches
- **"retry"**: Show exact matches only. If none were found, show fuzzy matches

```js
// Control fuzzy matching used for typo-tolerance
// Possible values true/false/"auto"/"retry" (default: "auto")
client.setFuzzyMatch(false);
```

#### Search operator

When a user searches with multiple keywords, we return only documents that contain all the terms
which means applying the logical operator AND for the query. It is possible to choose which logical
operator to use for fuzzy results when the fuzzy parameter is set to auto. There are two options:

- **"or"**: makes fuzzy results broader and includes partial matches of a few search terms
- **"and"**: makes fuzzy results stricter and includes only mistyped search terms

```js
// Possible values "and"/"or" (default: "or")
client.setSearchOperator('and');
```

#### Postfix wildcard

Enable or disable postfix wildcard. I.e. should keyword "add" match to "addsearch" or should it just
match to the term **add**

```js
// Possible values true/false (default: true)
client.setPostfixWildcard(false);
```

#### Set enableLogicalOperators

```js
// (default: false)
// enableLogicalOperators(true) = Support user specified logical operators (and/or/not) in the search query like "cat and dog"
// enableLogicalOperators(false) = Treat logical operators in the search query as literal strings
client.enableLogicalOperators(true);
```

#### Set cacheResponseTime

Caching the response, define the time-to-live of the cache.

```js
// Specify time-to-live value in seconds
client.setCacheResponseTime(3600);
```

Please contact our
[Support](https://github.com/AddSearch/js-client-library?tab=readme-ov-file#support) team to active
Response Caching for your index.

### Pagination

Set page number, page size and sorting parameters. It's possible to order results by:

- relevance (descending)
- date (ascending or descending)
- custom field value (ascending or descending. E.g. _custom_fields.price_)

Type of sortBy and sortOrder: `string` or `array`. They must have the same type, in case type is
array, sortBy and sortOrder must have the same size. For example:

```js
sortBy = 'date';
sortOrder = 'desc';

or;

sortBy = ['date', 'custom_fields.price'];
sortOrder = ['desc', 'asc'];
```

```js
// Defaults: page: 1, pageSize: 10, sortBy: "relevance", sortOrder: "desc"
client.setPaging(page, pageSize, sortBy, sortOrder);
```

Other functions.

```js
// Next page (call search function to fetch results)
client.nextPage();

// Previous page
client.previousPage();
```

### Filters

#### Define language filter

```js
// Fetch documents in specific language (e.g. "en" or "de" or "en-GB")
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

Filter by URL patterns, document types or _addsearch-category_ meta tag values. See the
[full documentation.](https://www.addsearch.com/support/documentation/ranking-relevance-filters/filters/#category-filters)

```js
// Only PDF files or products
client.setCategoryFilters('doctype_pdf,products');
```

#### Custom field filters

Filter by custom fields. Custon fields can be defined in meta tags or AddSearch crawler can pick
them up from your HTML or JSON data. See the
[full documentation.](https://www.addsearch.com/support/documentation/ranking-relevance-filters/custom-field/)

```js
// Search by specific city (Berlin, Paris or Boston)
client.addCustomFieldFilter('city', 'berlin');
client.addCustomFieldFilter('city', 'paris');
client.addCustomFieldFilter('city', 'boston');

// Remove Paris (Berlin and Boston remaining)
client.removeCustomFieldFilter('city', 'paris');

// Remove all cities
client.removeCustomFieldFilter('city');
```

#### Set filtering object

Set complex filtering object that can contain nested _and_, _or_, _not_, and _range_ filters.

```js
// Find results where brand is apple, color is not white, and price is between 200 and 500
var filter = {
  and: [
    { 'custom_fields.brand': 'apple' },
    { not: { 'custom_fields.color': 'white' } },
    { range: { 'custom_fields.price': { gt: 200, lt: 500 } } }
  ]
};

client.setFilterObject(filter);
```

#### Set result type

```js
// By default, fetch all search results
// If "organic", Pinned results and Promotions are left out
client.setResultType('organic');
```

### Facets

```js
// Declare fields for faceting. Number of hits found from
// these fields will be returned
client.addFacetField('category');
client.addFacetField('custom_fields.genre');
```

By default, 10 facets with most hits are returned per field. Use the following function to get more
or less facets.

```js
client.setNumberOfFacets(20);
```

#### Numerical range facets

Group numerical custom fields into range buckets.

```js
// Define ranges. E.g. products with price $0-$100, $100-$200, and over $200.
// From value is inclusive, to value is exclusive
var ranges = [{ to: 100 }, { from: 100, to: 200 }, { from: 200 }];

// Parameters: field name, range array
client.addRangeFacet('custom_fields.price', ranges);
```

### Field statistics

Get minimum, maximum, and average values of a numerical or date-based custom field. The information
is handy for applications like range filtering.

```js
// Search response will have a fieldStats element with information like
// custom_fields.price: {min: 1230, max: 1590, avg: 1382}
client.addStatsField('custom_fields.price');
```

### Recommendations

#### Frequently bought together items

Get frequently bought together items, given "configurationKey" and "itemId"

```js
// fetch frequently bought together items
client.recommendations({
  configurationKey: 'config1',
  itemId: '1065921'
});
```

### Search analytics

#### Send search event to analytics

When search is executed, send the event to your AddSearch Analytics Dashboard.

```js
// If the numberOfResults is 0, the search is shown in the list of "queries with no hits"
client.sendStatsEvent('search', keyword, { numberOfResults: n });
```

#### Send click event to analytics

When a search results is clicked, send the event to your AddSearch Analytics Dashboard. Click
information is shown in your statistics and used by the self-learning search algorithm.

```js
// documentId is the 32-character long id that is part of each hit in search results.
// position is the position of the document that was clicked, the first result being 1
client.sendStatsEvent('click', keyword, { documentId: id, position: n });
```

#### Set or get stats session ID

Control the search session ID manually. Search queries with the same ID are grouped on the Analytics
Dashboard. For example, in a search-as-you-type implementation the final keyword of a given session
is shown.

```js
client.getStatsSessionId();
client.setStatsSessionId(id);
```

#### Collect search events automatically

Send search events automatically to the Analytics Dashboard. Not recommended in search-as-you-type
implementations, as every keystroke would fire a statistics event

```js
// Control whether search queries are sent to your AddSearch Analytics Dashboard automatically or not (default: true)
client.setCollectAnalytics(false);
```

#### Set a tag for analytics events

Defines a tag associated with all analytics events reported by the client. These tags will be
available as filters in the AddSearch Analytics Dashboard. You can use tags, for instance, in A/B
testing to compare which search UIs are most effective. Splitting the analytics with tags may also
provide insights to the behaviour of audiences on different websites.

```js
// Specify a tag for analytics events (the maximum length is 50 characters)
client.setAnalyticsTag('Navigation search');
```

### Personalization

#### Enable personalization tracking

Enable personalization tracking, user token will be included in every stat events as "session ID".
<br/>

Set stats session ID if user token is generated by your site.

```js
client.setStatsSessionId(userToken);
```

If session is not set, a UUID is generated and stored in a cookie named 'addsearchUserToken`.
Specify the expiration date of the cookie. Default is 180.

```js
// Defaults - isEnabled: false, expirationDates: 180
client.enablePersonalizationTracking(isEnabled, expirationDates);
```

#### Allow storing AddSearch's user token in cookie

By default, the value is false. Set it to false when users reject cookie (AddSearch's cookie can be
categorized as functional/analytics cookie), or set to true when user accepts cookie.

```js
// Default: false
client.consentAddSearchCookie(true);
```

#### Set user token to search query (for personalized search results)

```js
// Add a user token to the search request (if personalization in use)
client.setUserToken(userToken);
```

#### Get user token from AddSearch cookie

Get the user token which is stored in AddSearch cookie (if available).

```js
// Get a user token
client.getUserTokenInPersonalization();
```

#### Send personalization events with search query - deprecated

In personalized search, user events are typically sent to AddSearch via API and a user token is
passed with the search query (see setUserToken function). An alternative way is to send user events
needed for personalization with the search query.

```js
// Events depend on the personalization strategy
// Contact AddSearch for more information
var events = [
  { favorite_genre: 'rock' },
  { favorite_band: 'Red Hot Chili Peppers' },
  { least_favorite_genre: 'country' }
];

client.setPersonalizationEvents(events);
```

### Other

#### Set JSON Web Token (for authentication)

```js
// Add JWT to the search request (if protected search index)
client.setJWT(token);
```

#### Set API throttling

```js
// Set Search API throttle time in milliseconds. Default is 200.
client.setThrottleTime(500);
```

#### Set API hostname

`option` is an object with the following properties, all of which are optional. If `option` is not
defined, host name will be applied for all requests.

- **searchApiRequestOnly**: If true, the new host name is only applied for searchApi requests
  (default: false)
- **statsApiRequestOnly**: If true, the new host name is only applied for statsApi requests
  (default: false)

```js
// Set API hostname (e.g. for dedicated environments)
client.setApiHostname('api.addsearch.com', option);
```

#### Set API request interceptor

`configurationObject` contains 2 keys: <string>`url` and <object>`headers`. Modify the
`configurationObject` before it is sent.

`option` is an object with the following properties, all of which are optional. If `option` is not
defined, the interceptor will be used for all requests.

- **searchApiRequestOnly**: If true, the interceptor is only used for searchApi requests (default:
  false)
- **statsApiRequestOnly**: If true, the interceptor is only used for statsApi requests (default:
  false)

```js
function callback(configurationObject) {
  configurationObject.headers['X-Api-Key'] = 'YOUR API KEY';
  return configurationObject;
}
client.setApiRequestInterceptor(callback, option);
```

## AI Answers API

#### Fetch AI answers

```js
// Get AI generated answer with a question
client.aiAnswers('A question to get AI generated answers', callback);
```

Example of callback function and how the response looks like:
```js
callbackFn = function (response) {
  
  console.log(response);
  
  // response object contains the answer
  // {
  //   "answer": "The answer to the question",
  //   "conversation_id": "31f33b53-1fe1-4734-884f-fefa470f1389",
  //   "ids": <array of ids belonging to source documents>, for example ['073010f023db7c6d558123f73a9b4f82', '821f7bea12daf0eda17ba2755979f7a5'],
  //   "source_documents": <documents that provide context for AI generated answers, the object of this field looks similarly to the response of regular SearchApi result>
  // }
};
````

#### Send Sentiment Analysis

```js
// possible sentiment_value: positive, negative
client.putSentimentClick('conversation_id', 'sentiment_value');
```

## Indexing API

With the Indexing API, you can fetch, create, update, and delete single documents or batches of
documents.

Indexing API functions are meant to be used with Node.js. Never expose secret key in your website
code.

```js
// Create client with your keys
var client = new AddSearchClient('YOUR PUBLIC SITEKEY', 'YOUR SECRET KEY');
```

The secret key can be found from AddSearch Dashboard's "Setup" > "Keys and installation" page.
Always keep the key secret.

All Indexing API functions are Promise-based.

### Document structure

Documents can contain a set of pre-defined fields, as well as any number of custom fields defined
under the **custom_fields** key.

Using pre-defined fields is optional, but default
[Search UI](https://github.com/AddSearch/search-ui) components display them by default, so
pre-defined field give you visible results a bit faster.

Pre-defined fields are: url, title, and main_content.

Example document:

```js
const doc = {
  id: '1234',
  url: 'https://www.example-store.com/product-x',
  title: 'Example product',
  main_content: 'Lorem ipsum',
  custom_fields: {
    name: 'Example product',
    description: 'Description for the example product',
    price_cents: 599,
    average_customer_rating: 4.5,
    release_date: 1589200255
  }
};
```

Data types for custom fields are automatically detected from the content. Supported data types are:

- text
- integer
- double

Dates should be defined as UNIX timestamps with integer values.

### Document ID

If the **id** is not defined in the document at indexing time, it is generated automatically either
randomly or from the **url** field.

```js
// ID defined by the user
const docWithDefinedId = {
  id: '1234',
  custom_fields: {}
};
```

```js
// ID created from the URL field (md5 of the url)
const docWithURL = {
  url: 'https://..',
  custom_fields: {}
};
```

```js
// ID generated randomly
const docWithAutogeneratedId = {
  // No id or url fields
  custom_fields: {}
};
```

### Save document

Add a document to the index, or update a document.

```js
const doc = {
  id: '1234',
  custom_fields: {
    name: 'Example product'
  }
};

// Save document
client
  .saveDocument(doc)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Get document by ID

Fetch a specific document by ID.

```js
client
  .getDocument(id)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Delete document by ID

Delete a specific document by ID.

```js
client
  .deleteDocument(id)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Save batch of documents

Add or update bunch of documents defined in an array.

```js
const batch = {
  documents: [
    {
      id: '1234',
      custom_fields: {
        name: 'Product 1'
      }
    },
    {
      id: '5678',
      custom_fields: {
        name: 'Product 2'
      }
    }
  ]
};

// Save batch of documents
client
  .saveDocumentsBatch(batch)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Delete batch of documents

Delete multiple documents with an array of document IDs.

```js
// Array of document IDs
const batch = {
  documents: ['1234', '5678']
};

// Delete batch of documents
client
  .deleteDocumentsBatch(batch)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

## Supported browsers

The client is tested on

- Chrome
- Firefox
- Edge
- Safari 6.1+
- Internet Explorer 10+
- Node.js

## Development

To modify this client library, clone this repository to your computer and execute following
commands.

#### Install dependencies

```sh
npm install
```

#### Code

Re-compile automatically when source files are changed

```sh
npm run watch
```

#### Run tests

```sh
npm test
```

#### Build

```sh
npm run build
```

Built bundle is saved under the _dist/_ folder

## Support

Feel free to send any questions, ideas, and suggestions at
[support@addsearch.com](mailto:support@addsearch.com) or visit
[addsearch.com](https://www.addsearch.com/) for more information.
