define('ruhungry/models/order', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Order = DS['default'].Model.extend({
		cardName: DS['default'].attr("string"),
		cardNumber: DS['default'].attr("string"),
		street: DS['default'].attr("string"),
		city: DS['default'].attr("string"),
		zipcode: DS['default'].attr("string"),
		phoneNumber: DS['default'].attr("string"),
		deliveryTime: DS['default'].attr("string"),
		amount: DS['default'].attr("string"),
		tax: DS['default'].attr("string"),
		totalAmount: DS['default'].attr("string"),
		date: DS['default'].attr("date"),
		// restaurants: DS.attr(),
		status: DS['default'].attr("string", {
			defaultValue: "In Processing"
		}),
		user: DS['default'].belongsTo("user")
	});

	Order.reopenClass({
		FIXTURES: [{
			id: "10004",
			deliveryTime: "1:30 PM -- 2:00 PM",
			street: "500 El Camino Real",
			city: "Santa Clara, CA",
			zipcode: "95053",
			phoneNumber: "(650)611-0001",
			amount: "$30.05",
			tax: "$2.95",
			totalAmount: "$33.00",
			date: "03/17/2015"
		}]
	});

	exports['default'] = Order;

});