define('ruhungry/routes/payment', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var PaymentRoute = Ember['default'].Route.extend({
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

	exports['default'] = PaymentRoute;

});