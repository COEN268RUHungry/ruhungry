import DS from "ember-data";

var Order = DS.Model.extend({
	cardName: DS.attr("string"),
	cardNumber: DS.attr("string"),
	street: DS.attr("string"),
	city: DS.attr("string"),
	zipcode: DS.attr("string"),
	phoneNumber: DS.attr("string"),
	deliveryTime: DS.attr("string"),
	amount: DS.attr("string"),
	tax: DS.attr("string"),
	totalAmount: DS.attr("string"),
	date: DS.attr("date"),
	// restaurants: DS.attr(),
	status: DS.attr("string", {
		defaultValue: "In Processing"
	}),
	user: DS.belongsTo("user")
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

export default Order;