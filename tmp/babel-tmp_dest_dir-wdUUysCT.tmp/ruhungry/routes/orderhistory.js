import Ember from "ember";

var OrderhistoryRoute = Ember.Route.extend({
	model: function model() {
		return this.store.find("order");
	},
	setupController: function setupController(controller, model) {
		controller.set("content", model);
	} });

export default OrderhistoryRoute;