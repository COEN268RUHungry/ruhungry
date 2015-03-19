define('ruhungry/controllers/google-map/markers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.markerController"),
    model: Ember['default'].computed.alias("parentController.markers")
  });

});