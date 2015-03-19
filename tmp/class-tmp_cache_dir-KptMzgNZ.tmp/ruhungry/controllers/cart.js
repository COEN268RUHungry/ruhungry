define('ruhungry/controllers/cart', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var CartController = Ember['default'].ObjectController.extend({
		foodQuantity: 0,
		actions: {
			decrease: function decrease(item) {
				item.set("quantity", item.get("quantity") - 1);
				this.set("foodQuantity", this.get("foodQuantity") - 1);
				if (item.get("quantity") === 0) {
					item.deleteRecord();
					item.save();
				}
			},
			increase: function increase(item) {
				item.set("quantity", item.get("quantity") + 1);
				this.set("foodQuantity", this.get("foodQuantity") + 1);
			},
			checkout: function checkout() {
				this.transitionToRoute("payment");
			}
		}
	});

	exports['default'] = CartController;

});