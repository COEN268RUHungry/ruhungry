import Ember from 'ember';

var CreateuserRoute = Ember.Route.extend({

	model: function() {
		return this.store.find('user');
	},
	setupController: function(controller, model) {
    	controller.set('content', model);     
  	},
  	
    
    
});


export default CreateuserRoute;