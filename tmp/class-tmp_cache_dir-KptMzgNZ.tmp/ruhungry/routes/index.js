define('ruhungry/routes/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var IndexRoute = Ember['default'].Route.extend({
    beforeModel: function beforeModel() {
      this.transitionTo("search");
    }
  });

  exports['default'] = IndexRoute;

});