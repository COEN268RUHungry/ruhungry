define('ember-cli-dates/utils/time-locale', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  function timeLocale(optionalLocale) {
    if (Ember['default'].typeOf(optionalLocale) === 'string') {
      return optionalLocale;
    }

    return moment['default']().locale();
  }
  exports['default'] = timeLocale;

});