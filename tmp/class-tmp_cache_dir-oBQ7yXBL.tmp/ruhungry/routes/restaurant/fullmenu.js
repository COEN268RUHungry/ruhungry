define('ruhungry/routes/restaurant/fullmenu', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var RestaurantFullmenuRoute = Ember['default'].Route.extend({
			setupController: function setupController(controller, model) {
					var property = model.get("foodCategory")[0].property;
					controller.set("content", model).set("isNotFullmenu", false).set("currentCategory", model.get("formattedFoodMenu")[property]);
			}
	});

	exports['default'] = RestaurantFullmenuRoute;

});