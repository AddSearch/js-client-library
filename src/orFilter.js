'use strict';

var orFilter = function() {
  this.or = [];

  for (var i=0; i<arguments.length; i++) {
    this.or.push(arguments[i]);
  }
};

module.exports = orFilter;