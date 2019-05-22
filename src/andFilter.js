'use strict';

var andFilter = function() {
  this.and = [];

  for (var i=0; i<arguments.length; i++) {
    this.and.push(arguments[i]);
  }
};

module.exports = andFilter;