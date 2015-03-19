define('ruhungry/routes/search', ['exports', 'ember'], function (exports, Ember) {

   'use strict';

   var SearchRoute = Ember['default'].Route.extend({
      setupController: function setupController(controller) {
         controller.set("restaurantName", "").set("zipcode");
      }
   });

   exports['default'] = SearchRoute;

});