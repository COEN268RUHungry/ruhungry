define('ember-cli-dates/helpers/time-ahead-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeAheadInWords = timeAheadInWords;

  function timeAheadInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-ahead-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeAheadInWords);

});