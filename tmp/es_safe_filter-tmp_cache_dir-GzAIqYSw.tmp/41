import Ember from 'ember';

var LoginRoute = Ember.Route.extend({

	model: function() {
		return this.store.find('user');
	},
	setupController: function(controller, model) {
    	controller.set('content', model)
              	  .set('isLogged', false)
				  .set('userID', '0');        
  	},
  	
    
    
});


export default LoginRoute;