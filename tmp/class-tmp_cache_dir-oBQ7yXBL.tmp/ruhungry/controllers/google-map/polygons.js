define('ruhungry/controllers/google-map/polygons', ['exports', 'ember', 'ruhungry/controllers/google-map/polylines'], function (exports, Ember, GoogleMapPolylinesController) {

  'use strict';

  exports['default'] = GoogleMapPolylinesController['default'].extend({
    itemController: Ember['default'].computed.alias("parentController.polygonController"),
    model: Ember['default'].computed.alias("parentController.polygons"),
    pathController: Ember['default'].computed.alias("parentController.polygonPathController")
  });

});