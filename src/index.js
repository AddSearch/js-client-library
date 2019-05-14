import 'whatwg-fetch'
import { executeApiFetch } from './apifetch';

function client(sitekey) {
  this.sitekey = sitekey;

  /**
   * Fetch search results
   *
   * @param keyword
   */
  this.search = function(keyword) {
    this.apiFetch('search', keyword);
  };


  /**
   * Fetch search suggestions
   *
   * @param keyword
   */
  this.suggest = function(keyword) {
    this.apiFetch('suggest', keyword);
  };


  /**
   * Fetch from the API
   */
  this.apiFetch = executeApiFetch;
}

module.exports = client;