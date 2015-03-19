define('ruhungry/routes/discover', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var DiscoverRoute = Ember['default'].Route.extend({
		model: function model() {
			this.store.find("user");
			this.store.find("comment");
			return this.store.find("restaurant");
		}
	});

	exports['default'] = DiscoverRoute;

});