'use strict';

var filter = function(field, value) {
  this[field] = value;
};

module.exports = filter;