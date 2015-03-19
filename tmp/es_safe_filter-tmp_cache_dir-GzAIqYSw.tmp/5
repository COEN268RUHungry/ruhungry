import Ember from 'ember';

var DiscoverController = Ember.ArrayController.extend({
	queryParams: ['restaurantName', 'zipcode'],
	needs: 'search',
	restaurantName: Ember.computed.alias('controllers.search.restaurantName'),
	zipcode: Ember.computed.alias('controllers.search.zipcode'),
	
	actions: {
		search: function() {
			this.set('restaurantName', '');
			this.set('zipcode', '');
			this.transitionToRoute('search');
		}
	},
	
	filterSearch: function() {
		var restaurantName = this.get('restaurantName');
		var zipcode = this.get('zipcode');
		var restaurants = this.get('model');
		if (restaurantName || (zipcode && zipcode !== 'undefined')) {
			if (restaurantName) {
				return restaurants.filterBy('name', restaurantName);
			}
			else {
				return restaurants.filterBy('zipCode', zipcode);
			}
		}
		else {
			return restaurants;
		}
	}.property('restaurantName', 'zipcode', 'model')
});

export default DiscoverController;
