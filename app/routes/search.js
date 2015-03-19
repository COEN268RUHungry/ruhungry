import Ember from 'ember';

var SearchRoute = Ember.Route.extend({
	setupController: function(controller) {
    	controller.set('restaurantName', '')
				  .set('zipcode');        
  	}
});


export default SearchRoute;