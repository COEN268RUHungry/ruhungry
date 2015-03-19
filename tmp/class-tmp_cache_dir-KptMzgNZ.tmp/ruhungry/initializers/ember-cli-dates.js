define('ruhungry/initializers/ember-cli-dates', ['exports', 'ember', 'ember-cli-dates/helpers/time-format', 'ember-cli-dates/helpers/time-ago-in-words', 'ember-cli-dates/helpers/day-of-the-week', 'ember-cli-dates/helpers/time-ahead-in-words', 'ember-cli-dates/helpers/time-delta-in-words', 'ember-cli-dates/helpers/month-and-year', 'ember-cli-dates/helpers/month-and-day', 'ember-cli-dates/helpers/date-and-time'], function (exports, Ember, time_format, time_ago_in_words, day_of_the_week, time_ahead_in_words, time_delta_in_words, month_and_year, month_and_day, date_and_time) {

  'use strict';

  var initialize = function initialize() {
    Ember['default'].Handlebars.helper("time-format", time_format.timeFormat);
    Ember['default'].Handlebars.helper("time-ago-in-words", time_ago_in_words.timeAgoInWords);
    Ember['default'].Handlebars.helper("day-of-the-week", day_of_the_week.dayOfTheWeek);
    Ember['default'].Handlebars.helper("time-ahead-in-words", time_ahead_in_words.timeAheadInWords);
    Ember['default'].Handlebars.helper("time-delta-in-words", time_delta_in_words.timeDeltaInWords);
    Ember['default'].Handlebars.helper("month-and-year", month_and_year.monthAndYear);
    Ember['default'].Handlebars.helper("month-and-day", month_and_day.monthAndDay);
    Ember['default'].Handlebars.helper("date-and-time", date_and_time.dateAndTime);
  };

  exports['default'] = {
    name: "ember-cli-dates",
    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});