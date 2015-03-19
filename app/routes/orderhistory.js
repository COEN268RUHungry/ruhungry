import Ember from 'ember';

var OrderhistoryRoute = Ember.Route.extend({
	model: function() {
		return this.store.find('order');
	},
	setupController: function(controller, model) {
    	controller.set('content', model);
              	        
  	},
});

export default OrderhistoryRoute;