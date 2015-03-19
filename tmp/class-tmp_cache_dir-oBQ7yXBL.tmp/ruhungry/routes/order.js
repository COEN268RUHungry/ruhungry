define('ruhungry/routes/order', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var OrderRoute = Ember['default'].Route.extend({
		model: function model(param) {
			return this.store.find("order", param.order_id);
		}
	});

	exports['default'] = OrderRoute;

});