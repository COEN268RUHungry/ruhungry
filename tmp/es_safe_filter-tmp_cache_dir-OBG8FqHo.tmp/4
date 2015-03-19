import Ember from 'ember';

var CreateuserController = Ember.ObjectController.extend({
	
	actions:{
        createUser:function(){
            var userId = Date.now();
            var userData = {
                id: userId,
                name: Ember.$('#new-name').val(),
                email: Ember.$('#new-email').val(),
                address: Ember.$('#new-address').val(),
                zipCode: Ember.$('#new-zip').val(),
                password: Ember.$('#new-pwd').val(),
                status: true
            };
            console.log(userData);
            this.store.push('user', userData);
            this.transitionToRoute('login');
        }
    },
	
});
export default CreateuserController;