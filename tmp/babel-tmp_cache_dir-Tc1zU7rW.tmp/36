import Ember from "ember";

var AccountRoute = Ember.Route.extend({
  controllerName: "login",
  model: function model() {
    return this.store.find("user");
  },
  setupController: function setupController(controller, model) {
    controller.set("content", model);
  },
  actions: {
    toggleAddressDiv: function toggleAddressDiv() {
      Ember.$("#address-div").toggleClass("hide");
    },
    togglePaymentDiv: function togglePaymentDiv() {
      Ember.$("#payment-div").toggleClass("hide");
    },
    toggleContactDiv: function toggleContactDiv() {
      Ember.$("#contact-div").toggleClass("hide");
    } }
});

export default AccountRoute;