import Ember from "ember";

var RestaurantFullmenuController = Ember.ObjectController.extend({
	needs: ["cart"],
	foodQuantity: Ember.computed.alias("controllers.cart.foodQuantity"),
	currentProperty: "",

	actions: {
		back: function back() {
			this.set("isNotFullmenu", true);
			this.transitionToRoute("restaurant");
		},
		selectCategory: function selectCategory(item) {
			this.set("currentCategory", this.get("content").get("formattedFoodMenu")[item.property]);
		},
		add: function add(item) {
			var number = this.get("foodQuantity") + 1;
			this.set("foodQuantity", number);
			var self = this;
			this.store.push("food", {
				id: item.foodID,
				name: item.foodName,
				price: item.foodPrice,
				restaurant: this.get("content")
			}).save().then(function (result) {
				result.set("quantity", result.get("quantity") + 1);
				self.store.find("cart", 0).then(function (res) {
					res.get("foods").pushObject(result);
				});
			});
		}
	},
	currentCategoryChange: function currentCategoryChange() {
		var foodCategory = this.get("foodCategory"),
		    currentProperty = this.get("currentProperty");
		for (var i = 0; i < foodCategory.length; i++) {
			if (foodCategory[i].property === currentProperty) {
				foodCategory[i].set("isCurrent", true);
			} else {
				foodCategory[i].set("isCurrent", false);
			}
		}
	}
});

export default RestaurantFullmenuController;