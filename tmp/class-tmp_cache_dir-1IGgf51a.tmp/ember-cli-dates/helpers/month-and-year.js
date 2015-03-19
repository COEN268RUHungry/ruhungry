define('ember-cli-dates/helpers/month-and-year', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.monthAndYear = monthAndYear;

  function monthAndYear(date, optionalLocale) {
    validArgs['default'](arguments, 'day-of-the-week');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).format('MMM YYYY');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(monthAndYear);

});