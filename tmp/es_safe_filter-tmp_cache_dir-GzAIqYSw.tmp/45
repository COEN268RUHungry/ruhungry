import Ember from 'ember';

var RestaurantFullmenuRoute = Ember.Route.extend({
	setupController: function(controller, model) {
		var property = model.get('foodCategory')[0].property;
    	controller.set('content', model)
				  .set('isNotFullmenu', false)
				  .set('currentCategory', model.get('formattedFoodMenu')[property]);        
  	}
});


export default RestaurantFullmenuRoute;