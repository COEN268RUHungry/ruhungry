define('ember-cli-dates/helpers/time-ago-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeAgoInWords = timeAgoInWords;

  function timeAgoInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-ago-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeAgoInWords);

});