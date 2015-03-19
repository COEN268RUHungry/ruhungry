define('ruhungry/controllers/google-map/polyline', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    pathController: Ember['default'].computed.alias("parentController.pathController"),

    _path: Ember['default'].computed("path", "pathController", function () {
      return this.container.lookupFactory("controller:" + this.get("pathController")).create({
        parentController: this
      });
    }).readOnly()
  });

});