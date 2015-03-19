define('ruhungry/views/gallery', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var GalleryView = Ember['default'].View.extend({
    templateName: "gallery",
    hammerOptions: {
      swipe_velocity: 0.5
    },
    gestures: {
      swipeLeft: function swipeLeft() {
        this.get("controller").send("increaseImage");
        return false;
      },
      swipeRight: function swipeRight() {
        this.get("controller").send("decreaseImage");
        return false;
      }
    }
  });

  exports['default'] = GalleryView;

});