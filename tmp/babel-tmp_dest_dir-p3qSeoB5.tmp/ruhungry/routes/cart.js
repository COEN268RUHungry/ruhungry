import Ember from "ember";

var CartRoute = Ember.Route.extend({
	model: function model() {
		return this.store.find("cart", 0);
	},
	setupController: function setupController(controller, model) {
		controller.set("content", model);
		//					.set('foodQuantity', 0);      
	}
});

export default CartRoute;