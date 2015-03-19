define('ruhungry/controllers/google-map/info-windows', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.infoWindowController"),
    model: Ember['default'].computed.alias("parentController.infoWindows")
  });

});