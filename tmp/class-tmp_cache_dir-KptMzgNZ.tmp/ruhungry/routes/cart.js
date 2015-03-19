define('ruhungry/routes/cart', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var CartRoute = Ember['default'].Route.extend({
		model: function model() {
			return this.store.find("cart", 0);
		},
		setupController: function setupController(controller, model) {
			controller.set("content", model);
			//					.set('foodQuantity', 0);      
		}
	});

	exports['default'] = CartRoute;

});