define('ruhungry/controllers/google-map/polylines', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.polylineController"),
    model: Ember['default'].computed.alias("parentController.polylines"),
    pathController: Ember['default'].computed.alias("parentController.polylinePathController")
  });

});