define('ruhungry/controllers/google-map/circles', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.circleController"),
    model: Ember['default'].computed.alias("parentController.circles")
  });

});