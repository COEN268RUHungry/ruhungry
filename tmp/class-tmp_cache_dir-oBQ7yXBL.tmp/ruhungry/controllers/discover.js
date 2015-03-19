define('ruhungry/controllers/discover', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var DiscoverController = Ember['default'].ArrayController.extend({
		queryParams: ["restaurantName", "zipcode"],
		needs: "search",
		restaurantName: Ember['default'].computed.alias("controllers.search.restaurantName"),
		zipcode: Ember['default'].computed.alias("controllers.search.zipcode"),

		actions: {
			search: function search() {
				this.set("restaurantName", "");
				this.set("zipcode", "");
				this.transitionToRoute("search");
			}
		},

		filterSearch: (function () {
			var restaurantName = this.get("restaurantName");
			var zipcode = this.get("zipcode");
			var restaurants = this.get("model");
			if (restaurantName || zipcode && zipcode !== "undefined") {
				if (restaurantName) {
					return restaurants.filterBy("name", restaurantName);
				} else {
					return restaurants.filterBy("zipCode", zipcode);
				}
			} else {
				return restaurants;
			}
		}).property("restaurantName", "zipcode", "model")
	});

	exports['default'] = DiscoverController;

});