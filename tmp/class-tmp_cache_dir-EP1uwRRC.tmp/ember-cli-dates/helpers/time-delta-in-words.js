define('ember-cli-dates/helpers/time-delta-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeDeltaInWords = timeDeltaInWords;

  function timeDeltaInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-delta-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeDeltaInWords);

});