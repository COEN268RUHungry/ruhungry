import Ember from "ember";

var RestaurantRoute = Ember.Route.extend({
	model: function model(param) {
		this.store.find("user");
		this.store.find("comment");
		return this.store.find("restaurant", param.restaurant_id);
	},
	setupController: function setupController(controller, model) {
		controller.set("content", model).set("isNotFullmenu", true).set("isAddingComment", false).set("currentImageIndex", 0);
	}
});

export default RestaurantRoute;