import 'whatwg-fetch'
import { executeApiFetch } from './apifetch';

function client(sitekey) {
  this.sitekey = sitekey;

  /**
   * Fetch search results
   *
   * @param keyword
   */
  this.search = function(keyword, cb) {
    this.executeApiFetch('search', keyword, cb);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword, cb) {
    this.executeApiFetch('suggest', keyword, cb);
  };


  /**
   *
   */
  this.executeApiFetch = executeApiFetch;
}

module.exports = client;