define('ruhungry/routes/orderhistory', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var OrderhistoryRoute = Ember['default'].Route.extend({
		model: function model() {
			return this.store.find("order");
		},
		setupController: function setupController(controller, model) {
			controller.set("content", model);
		} });

	exports['default'] = OrderhistoryRoute;

});