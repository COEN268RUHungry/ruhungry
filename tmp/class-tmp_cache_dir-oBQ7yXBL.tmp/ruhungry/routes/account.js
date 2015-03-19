define('ruhungry/routes/account', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var AccountRoute = Ember['default'].Route.extend({
    controllerName: "login",
    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model);
    },
    actions: {
      toggleAddressDiv: function toggleAddressDiv() {
        Ember['default'].$("#address-div").toggleClass("hide");
      },
      togglePaymentDiv: function togglePaymentDiv() {
        Ember['default'].$("#payment-div").toggleClass("hide");
      },
      toggleContactDiv: function toggleContactDiv() {
        Ember['default'].$("#contact-div").toggleClass("hide");
      } }
  });

  exports['default'] = AccountRoute;

});