define('ruhungry/routes/createuser', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var CreateuserRoute = Ember['default'].Route.extend({

    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model);
    } });

  exports['default'] = CreateuserRoute;

});