define('ruhungry/views/google-map/core', ['exports', 'ember', 'ember-google-map/core/helpers', 'ember-google-map/mixins/google-object'], function (exports, Ember, helpers, GoogleObjectMixin) {

  'use strict';

  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var on = Ember['default'].on;

  /**
   * @class GoogleMapCoreView
   * @extends Ember.View
   * @uses GoogleObjectMixin
   */
  exports['default'] = Ember['default'].View.extend(GoogleObjectMixin['default'], {
    googleMapComponent: oneWay("parentView"),

    googleEventsTarget: oneWay("googleMapComponent.targetObject"),

    map: oneWay("googleMapComponent.map"),

    initGoogleObject: on("didInsertElement", function () {
      // force the creation of the object
      if (helpers['default'].hasGoogleLib() && !this.get("googleObject")) {
        this.createGoogleObject();
      }
    }),

    destroyGoogleObject: on("willDestroyElement", function () {
      var object = this.get("googleObject");
      if (object) {
        // detach from the map
        object.setMap(null);
        this.set("googleObject", null);
      }
    })
  });

});