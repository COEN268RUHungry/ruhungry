define('ruhungry/router', ['exports', 'ember', 'ruhungry/config/environment'], function (exports, Ember, config) {

   'use strict';

   var Router = Ember['default'].Router.extend({
      location: config['default'].locationType
   });

   Router.map(function () {
      this.route("search", { path: "/" });
      this.resource("discover");
      this.resource("restaurant", { path: "/restaurant/:restaurant_id" }, function () {
         this.route("fullmenu");
      });
      this.resource("cart");
      this.resource("payment");
      this.resource("sidemenu");
      this.resource("account");
      this.resource("orderhistory");
      this.route("login");
      this.route("order", { path: "/order/:order_id" });
      this.resource("createuser");
   });

   exports['default'] = Router;

});