import DS from "ember-data";

var Food = DS.Model.extend({
	name: DS.attr("string"),
	price: DS.attr("string"),
	quantity: DS.attr("number", {
		defaultValue: 0
	}),
	restaurant: DS.belongsTo("restaurant"),
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

export default Food;