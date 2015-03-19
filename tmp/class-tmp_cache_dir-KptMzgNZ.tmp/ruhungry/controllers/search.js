define('ruhungry/controllers/search', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var SearchController = Ember['default'].Controller.extend({
		actions: {
			find: function find() {
				this.transitionToRoute("discover");
			}
		}
	});

	exports['default'] = SearchController;

});