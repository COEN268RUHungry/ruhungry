import Ember from 'ember';

var AccountRoute = Ember.Route.extend({
  controllerName: 'login',
	model: function() {
		return this.store.find('user');
	},
	setupController: function(controller, model) {
      controller.set('content', model);
  	},
  	actions:{
  		toggleAddressDiv:function(){
  			Ember.$("#address-div").toggleClass("hide");
  		},
  		togglePaymentDiv:function(){
  			Ember.$("#payment-div").toggleClass("hide");
  		},
  		toggleContactDiv:function(){
  			Ember.$("#contact-div").toggleClass("hide");
  		},
      
  	}
});


export default AccountRoute;