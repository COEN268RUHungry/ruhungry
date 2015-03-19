define('ruhungry/controllers/createuser', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CreateuserController = Ember['default'].ObjectController.extend({

        actions: {
            createUser: function createUser() {
                var userId = Date.now();
                var userData = {
                    id: userId,
                    name: Ember['default'].$("#new-name").val(),
                    email: Ember['default'].$("#new-email").val(),
                    address: Ember['default'].$("#new-address").val(),
                    zipCode: Ember['default'].$("#new-zip").val(),
                    password: Ember['default'].$("#new-pwd").val(),
                    status: true
                };
                console.log(userData);
                this.store.push("user", userData);
                this.transitionToRoute("login");
            }
        } });
    exports['default'] = CreateuserController;

});