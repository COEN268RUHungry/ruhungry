define('ember-cli-dates/helpers/date-and-time', ['exports', 'ember', 'ember-cli-dates/helpers/time-format'], function (exports, Ember, time_format) {

  'use strict';

  exports.dateAndTime = dateAndTime;

  function dateAndTime(date, optionalLocale) {
    return time_format.timeFormat(date, 'LLL', optionalLocale);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(dateAndTime);

});