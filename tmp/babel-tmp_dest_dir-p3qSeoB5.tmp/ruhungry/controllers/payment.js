import Ember from "ember";

var PaymentController = Ember.ObjectController.extend({
	needs: ["login", "cart"],
	isLogged: Ember.computed.alias("controllers.login.isLogged"),
	userID: Ember.computed.alias("controllers.login.userID"),
	foodQuantity: Ember.computed.alias("controllers.cart.foodQuantity"),
	isShowingPayment: false,
	isShowingAddress: false,
	isShowingError: false,
	cardName: "",
	cardNumber: "",
	stree: "",
	city: "",
	zipcode: "",
	phone: "",
	selectedTime: "11:30 AM -- 12:00 PM",
	availableDeliveryTime: ["11:30 AM -- 12:00 PM", "12:00 PM -- 12:30 PM", "12:30 PM -- 1:00 PM", "1:00 PM -- 1:30 PM", "1:30 PM -- 2:00 PM"],
	actions: {
		showPayment: function showPayment() {
			this.set("isShowingPayment", !this.get("isShowingPayment"));
		},
		showAddress: function showAddress() {
			this.set("isShowingAddress", !this.get("isShowingAddress"));
		},
		placeOrder: function placeOrder() {
			if (this.validateInformation()) {
				var order = this.store.createRecord("order", {});
				order.set("cardName", this.get("cardName")).set("cardNumber", this.get("cardNumber")).set("street", this.get("street")).set("city", this.get("city")).set("zipcode", this.get("zipcode")).set("phoneNumber", this.get("phone")).set("deliveryTime", this.get("selectedTime")).set("amount", this.get("totalAmount")).set("tax", this.get("tax")).set("totalAmount", this.get("total")).set("date", new Date());
				var restaurants = this.get("model").get("restaurantsList").copy();
				order.set("restaurants", restaurants);
				console.log(order.get("restaurants"));
				this.store.find("user", this.get("userID")).then(function (result) {
					order.set("user", result);
					order.save();
				});
				this.set("cardName", "").set("cardNumber", "").set("street", "").set("city", "").set("zipcode", "").set("phone", "").set("selectedTime", "").set("isShowingError", false).set("isShowingPayment", false).set("isShowingAddress", false);
				this.clearCart();
				this.transitionToRoute("order", order.id);
			} else {
				this.set("isShowingError", true);
			}
		}
	},

	tax: (function () {
		var amount = parseFloat(this.get("totalAmount").substring(1));
		var tax = amount * 0.0875;
		return "$" + tax.toFixed(2);
	}).property("model.totalAmount"),

	total: (function () {
		var amount = parseFloat(this.get("totalAmount").substring(1));
		var tax = parseFloat(this.get("tax").substring(1));
		var total = amount + tax;
		return "$" + total.toFixed(2);
	}).property("model.totalAmount"),

	validateInformation: function validateInformation() {
		if (this.get("cardName") === "" || this.get("cardNumber") === "" || this.get("street") === "" || this.get("city") === "" || this.get("zipcode") === "" || this.get("phone") === "") {
			return false;
		}
		return true;
	},
	clearCart: function clearCart() {
		this.store.find("food").then(function (res) {
			res.forEach(function (item) {
				item.deleteRecord();
				item.save();
			});
		});
		this.set("foodQuantity", 0);
	}
});

export default PaymentController;