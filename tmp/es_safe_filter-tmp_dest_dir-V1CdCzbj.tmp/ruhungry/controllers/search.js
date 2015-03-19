import Ember from 'ember';

var SearchController = Ember.Controller.extend({
	actions: {
		find: function() {
			this.transitionToRoute('discover');
		}
	}
});

export default SearchController;