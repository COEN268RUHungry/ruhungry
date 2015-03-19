define('ruhungry/controllers/sidemenu', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var SidemenuController = Ember['default'].ObjectController.extend({
		needs: "login",
		login: Ember['default'].computed.alias("controllers.login")

	});
	exports['default'] = SidemenuController;

});