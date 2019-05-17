/**
 * Fetch search results of search suggestions from the Addsearch API
 */
export function executeApiFetch(type, keyword, cb) {
  fetch('https://api.addsearch.com/v1/' + type + '/' + this.sitekey + '?term=' + keyword)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
    cb(json);
  }).catch(function(ex) {
    console.log('JSON parsing failed', ex);
  });
};


/**
 * Fetch search results of search suggestions from the Addsearch API
 */
export function executeApiPost(sitekey, settings, keyword, cb) {
  var payload = settings || {};
  payload.term = keyword;

  fetch('https://apitest.addsearch.com/v1/search/' + sitekey, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers:{
            'Content-Type': 'application/json'
          }
      })
    .then(function(response) {
      return response.json();
    }).then(function(json) {
    //console.log('parsed json', json);
    cb(json);
  }).catch(function(ex) {
    console.log('parsing failed', ex);
  });
};

