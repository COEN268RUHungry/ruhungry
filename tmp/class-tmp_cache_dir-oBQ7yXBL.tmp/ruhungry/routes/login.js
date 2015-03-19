define('ruhungry/routes/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var LoginRoute = Ember['default'].Route.extend({

    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model).set("isLogged", false).set("userID", "0");
    } });

  exports['default'] = LoginRoute;

});