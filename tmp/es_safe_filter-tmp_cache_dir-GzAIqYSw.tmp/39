import Ember from 'ember';

var DiscoverRoute = Ember.Route.extend({
	model: function() {
		this.store.find('user');
		this.store.find('comment');
		return this.store.find('restaurant');
	}
});


export default DiscoverRoute;