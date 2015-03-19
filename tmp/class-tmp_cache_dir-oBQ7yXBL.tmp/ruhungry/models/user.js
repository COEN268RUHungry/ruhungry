define('ruhungry/models/user', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var User = DS['default'].Model.extend({
		name: DS['default'].attr("string"),
		email: DS['default'].attr("string"),
		address: DS['default'].attr("string"),
		zipCode: DS['default'].attr("string"),
		comments: DS['default'].hasMany("comment", { async: true }),
		password: DS['default'].attr("string")

	});

	User.reopenClass({
		FIXTURES: [{
			id: "0",
			name: "Guest" }, {
			id: "1",
			name: "Su",
			email: "su@scu.edu",
			address: "500 El Camino Real, Santa Clara, CA",
			zipCode: "95053",
			password: "sususu",
			status: false

		}, {
			id: "2",
			name: "Fay",
			email: "fay@scu.edu",
			address: "500 ElCamino Real, Santa Clara, CA",
			zipCode: "95053",
			password: "huihui",
			status: false
		}]

	});

	exports['default'] = User;

});