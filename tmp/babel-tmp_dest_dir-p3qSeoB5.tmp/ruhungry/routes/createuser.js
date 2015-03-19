import Ember from "ember";

var CreateuserRoute = Ember.Route.extend({

  model: function model() {
    return this.store.find("user");
  },
  setupController: function setupController(controller, model) {
    controller.set("content", model);
  } });

export default CreateuserRoute;