define('ember-cli-dates/helpers/day-of-the-week', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.dayOfTheWeek = dayOfTheWeek;

  function dayOfTheWeek(date, optionalLocale) {
    validArgs['default'](arguments, 'day-of-the-week');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).format('dddd');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(dayOfTheWeek);

});