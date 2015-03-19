import Ember from "ember";

var PaymentRoute = Ember.Route.extend({
	beforeModel: function beforeModel() {
		if (!this.controllerFor("login").get("isLogged")) {
			this.transitionTo("login");
		}
	},

	model: function model() {
		this.store.find("user");
		return this.store.find("cart", 0);
	}
});

export default PaymentRoute;