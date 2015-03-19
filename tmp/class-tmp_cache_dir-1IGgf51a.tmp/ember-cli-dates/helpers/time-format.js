define('ember-cli-dates/helpers/time-format', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeFormat = timeFormat;

  function timeFormat(date, optionalFormat, optionalLocale) {
    validArgs['default'](arguments, 'time-format');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale),
        format = 'LL';

    if (Ember['default'].typeOf(optionalFormat) === 'string') {
      format = optionalFormat;
    }

    return moment['default'](date).locale(locale).format(format);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeFormat);

});