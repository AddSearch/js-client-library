/**
 * Fetch search results of search suggestions from the Addsearch API
 */
export function executeApiFetch(type, keyword) {
  fetch('https://api.addsearch.com/v1/' + type + '/' + this.sitekey + '?term=' + keyword)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
    console.log('parsed json', json);
  }).catch(function(ex) {
    console.log('parsing failed', ex);
  });
};

