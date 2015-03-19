define('ruhungry/models/food', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Food = DS['default'].Model.extend({
		name: DS['default'].attr("string"),
		price: DS['default'].attr("string"),
		quantity: DS['default'].attr("number", {
			defaultValue: 0
		}),
		restaurant: DS['default'].belongsTo("restaurant"),
		totalPrice: (function () {
			var price = this.get("price").substring(1),
			    quantity = this.get("quantity");
			return "$" + (parseFloat(price) * quantity).toFixed(2);
		}).property("price", "quantity")
	});

	Food.reopenClass({
		FIXTURES: [{
			id: "0",
			name: "Pudding",
			price: "$1.00",
			quantity: 2
		}, {
			id: "1",
			name: "Pudding",
			price: "$1.00",
			quantity: 2
		}]
	});

	exports['default'] = Food;

});