import 'whatwg-fetch'
import { settings, setPageSize } from './settings';
import { executeApiFetch, executeApiPost } from './apifetch';

function client(sitekey) {
  this.sitekey = sitekey;

  /**
   * Fetch search results
   *
   * @param keyword
   */
  this.search = function(keyword, cb) {
    //this.apiFetch('search', keyword, cb);
    executeApiPost(this.sitekey, settings, keyword, cb);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword, cb) {
    this.executeApiFetch('suggest', keyword, cb);
  };

  this.setPageSize = setPageSize;
}

module.exports = client;