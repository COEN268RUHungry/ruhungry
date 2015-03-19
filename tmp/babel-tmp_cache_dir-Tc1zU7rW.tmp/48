import Ember from "ember";

var GalleryView = Ember.View.extend({
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

export default GalleryView;