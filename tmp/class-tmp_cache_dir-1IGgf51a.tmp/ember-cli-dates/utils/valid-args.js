define('ember-cli-dates/utils/valid-args', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  function validArgs(args, helper) {
    if (Ember['default'].isEmpty(args) || args.length === 1) {
      throw new Ember['default'].Error('[ember-cli-dates:' + helper + '] Invalid number of arguments, expected at least 1');
    }
  }
  exports['default'] = validArgs;

});