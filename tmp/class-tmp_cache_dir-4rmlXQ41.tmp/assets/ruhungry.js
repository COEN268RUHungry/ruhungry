/* jshint ignore:start */

/* jshint ignore:end */

define('ruhungry/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].FixtureAdapter.extend();

});
define('ruhungry/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'ruhungry/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
    // customEvents: {
    //   // add support for the loadedmetadata media
    //   // player event
    //   'swipeLeft': "swipeLeft"
    // }
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('ruhungry/components/google-map', ['exports', 'ember', 'ember-google-map/core/helpers', 'ember-google-map/mixins/google-object'], function (exports, Ember, helpers, GoogleObjectMixin) {

  'use strict';

  /* globals google */
  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var on = Ember['default'].on;
  var fmt = Ember['default'].String.fmt;
  var forEach = Ember['default'].EnumerableUtils.forEach;
  var getProperties = Ember['default'].getProperties;
  var $get = Ember['default'].get;
  var dummyCircle;

  var VALID_FIT_BOUND_TYPES = ["markers", "infoWindows", "circles", "polylines", "polygons"];

  function getDummyCircle(center, radius) {
    if (radius == null) {
      radius = $get(center, "radius");
    }
    if (!(center instanceof google.maps.LatLng)) {
      center = helpers['default']._latLngToGoogle(center);
    }
    if (dummyCircle) {
      dummyCircle.setCenter(center);
      dummyCircle.setRadius(radius);
    } else {
      dummyCircle = new google.maps.Circle({ center: center, radius: radius });
    }
    return dummyCircle;
  }

  function collectCoordsOf(type, array, items) {
    if (["markers", "infoWindows"].indexOf(type) !== -1) {
      // handle simple types
      return array.reduce(function (previous, item) {
        var coords = getProperties(item, "lat", "lng");
        if (coords.lat != null && coords.lng != null) {
          previous.push(coords);
        }
        return previous;
      }, items || []);
    } else if (type === "circles") {
      // handle circles
      return array.reduce(function (previous, item) {
        var opt = getProperties(item, "lat", "lng", "radius"),
            bounds;
        if (opt.lat != null && opt.lng != null && opt.radius != null) {
          bounds = getDummyCircle(opt).getBounds();
          previous.push(helpers['default']._latLngFromGoogle(bounds.getNorthEast()));
          previous.push(helpers['default']._latLngFromGoogle(bounds.getSouthWest()));
        }
        return previous;
      }, items || []);
    } else if (["polylines", "polygons"]) {
      // handle complex types
      return array.reduce(function (previous, item) {
        return $get(item, "_path").reduce(function (previous, item) {
          var coords = getProperties(item, "lat", "lng");
          if (coords.lat != null && coords.lng != null) {
            previous.push(coords);
          }
          return previous;
        }, items || []);
      }, items || []);
    }
  }

  function obj(o) {
    return Ember['default'].Object.create(o);
  }

  var MAP_TYPES = Ember['default'].A([obj({ id: "road", label: "road" }), obj({ id: "satellite", label: "satellite" }), obj({ id: "terrain", label: "terrain" }), obj({ id: "hybrid", label: "hybrid" })]);

  var PLACE_TYPES = Ember['default'].A([obj({ id: helpers['default'].PLACE_TYPE_ADDRESS, label: "address" }), obj({ id: helpers['default'].PLACE_TYPE_LOCALITY, label: "locality" }), obj({ id: helpers['default'].PLACE_TYPE_ADMIN_REGION, label: "administrative region" }), obj({ id: helpers['default'].PLACE_TYPE_BUSINESS, label: "business" })]);

  /**
   * @class GoogleMapComponent
   * @extends Ember.Component
   * @uses GoogleObjectMixin
   */
  exports['default'] = Ember['default'].Component.extend(GoogleObjectMixin['default'], {
    googleFQCN: "google.maps.Map",

    classNames: ["google-map"],

    /**
     * Defines all properties bound to the google map object
     * @property googleProperties
     * @type {Object}
     */
    googleProperties: {
      zoom: { event: "zoom_changed", cast: helpers['default'].cast.integer },
      type: {
        name: "mapTypeId",
        event: "maptypeid_changed",
        toGoogle: helpers['default']._typeToGoogle,
        fromGoogle: helpers['default']._typeFromGoogle
      },
      "lat,lng": {
        name: "center",
        event: "center_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
      /**
       * available options (prepend with `gopt_` to use):
       * `backgroundColor`, `disableDefaultUI`, `disableDoubleClickZoom`, `draggable`, `keyboardShortcuts`,
       * `mapTypeControl`, `maxZoom`, `minZoom`, `overviewMapControl`, `panControl`, `rotateControl`, `scaleControl`,
       * `scrollwheel`, `streetViewControl`, `zoomControl`
       */
    },

    /**
     * @inheritDoc
     */
    googleEvents: {},

    /**
     * Our google map object
     * @property googleObject
     * @type {google.maps.Map}
     * @private
     */
    googleObject: null,

    /**
     * Auto fit bounds to type of items
     * @property autoFitBounds
     * @type {boolean|string}
     */
    autoFitBounds: false,

    /**
     * Fit bounds to view all coordinates
     * @property fitBoundsArray
     * @type {Array.<{lat: number, lng: number}>}
     */
    fitBoundsArray: computed("autoFitBounds", "_markers.@each", "_infoWindow.@each", "_polylines.@each._path.@each", "_polygons.@each._path.@each", "_circles.@each", function (key, value, oldValue) {
      var auto;
      if (arguments.length > 1) {
        // it's a set, save that the use defined them
        this._fixedFitBoundsArray = value;
      } else {
        if (this._fixedFitBoundsArray) {
          value = this._fixedFitBoundsArray;
        } else {
          // here comes our computation
          auto = this.get("autoFitBounds");
          if (auto) {
            auto = auto === true ? VALID_FIT_BOUND_TYPES : auto.split(",");
            value = [];
            forEach(auto, function (type) {
              collectCoordsOf(type, this.get("_" + type), value);
            }, this);
          } else {
            value = null;
          }
        }
      }
      return value;
    }),

    /**
     * Initial center's latitude of the map
     * @property lat
     * @type {Number}
     */
    lat: 0,

    /**
     * Initial center's longitude of the map
     * @property lng
     * @type {Number}
     */
    lng: 0,

    /**
     * Initial zoom of the map
     * @property zoom
     * @type {Number}
     * @default 5
     */
    zoom: 5,

    /**
     * Initial type of the map
     * @property type
     * @type {String}
     * @enum ['road', 'hybrid', 'terrain', 'satellite']
     * @default 'road'
     */
    type: "road",

    /**
     * List of markers to handle/show on the map
     * @property markers
     * @type {Array.<{lat: Number, lng: Number, title: String}>}
     */
    markers: null,

    /**
     * The array controller holding the markers
     * @property _markers
     * @type {Ember.ArrayController}
     * @private
     */
    _markers: computed(function () {
      return this.container.lookupFactory("controller:google-map/markers").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each marker
     * @property markerController
     * @type {String}
     * @default 'google-map/marker'
     */
    markerController: "google-map/marker",

    /**
     * View to use for each marker
     * @property markerViewClass
     * @type {String}
     * @default 'google-map/marker'
     */
    markerViewClass: "google-map/marker",

    /**
     * Info-window template name to use for each marker
     * @property markerInfoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    markerInfoWindowTemplateName: "google-map/info-window",

    /**
     * Whether the markers have an info-window by default
     * @property markerHasInfoWindow
     * @type {Boolean}
     * @default true
     */
    markerHasInfoWindow: true,

    /**
     * List of polylines to handle/show on the map
     * @property polylines
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polylines: null,

    /**
     * The array controller holding the polylines
     * @property _polylines
     * @type {Ember.ArrayController}
     * @private
     */
    _polylines: computed(function () {
      return this.container.lookupFactory("controller:google-map/polylines").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polyline
     * @property polylineController
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineController: "google-map/polyline",

    /**
     * Controller to use for each polyline's path
     * @property polylinePathController
     * @type {String}
     * @default 'google-map/polyline-path'
     */
    polylinePathController: "google-map/polyline-path",

    /**
     * View to use for each polyline
     * @property polylineViewClass
     * @type {String}
     * @default 'google-map/polyline'
     */
    polylineViewClass: "google-map/polyline",

    /**
     * List of polygons to handle/show on the map
     * @property polygons
     * @type {Array.<{path: Array.<{lat: Number, lng: Number}>>}
     */
    polygons: null,

    /**
     * The array controller holding the polygons
     * @property _polygons
     * @type {Ember.ArrayController}
     * @private
     */
    _polygons: computed(function () {
      return this.container.lookupFactory("controller:google-map/polygons").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each polygon
     * @property polygonController
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonController: "google-map/polygon",

    /**
     * Controller to use for each polygon's path
     * @property polygonPathController
     * @type {String}
     * @default 'google-map/polygon-path'
     */
    polygonPathController: "google-map/polygon-path",

    /**
     * View to use for each polygon
     * @property polygonViewClass
     * @type {String}
     * @default 'google-map/polygon'
     */
    polygonViewClass: "google-map/polygon",

    /**
     * List of circles to handle/show on the map
     * @property circles
     * @type {Array.<{lat: Number, lng: Number, radius: Number}>}
     */
    circles: null,

    /**
     * The array controller holding the circles
     * @property _circles
     * @type {Ember.ArrayController}
     * @private
     */
    _circles: computed(function () {
      return this.container.lookupFactory("controller:google-map/circles").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller to use for each circle
     * @property circleController
     * @type {String}
     * @default 'google-map/circle'
     */
    circleController: "google-map/circle",

    /**
     * View to use for each circle
     * @property circleViewClass
     * @type {String}
     * @default 'google-map/circle'
     */
    circleViewClass: "google-map/circle",

    /**
     * Array of al info-windows to handle/show (independent from the markers' info-windows)
     * @property infoWindows
     * @type {Array.<{lat: Number, lng: Number, title: String, description: String}>}
     */
    infoWindows: null,

    /**
     * The array controller holding the info-windows
     * @property _infoWindows
     * @type {Ember.ArrayController}
     * @private
     */
    _infoWindows: computed(function () {
      return this.container.lookupFactory("controller:google-map/info-windows").create({
        parentController: this
      });
    }).readOnly(),

    /**
     * Controller for each info-window
     * @property infoWindowController
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowController: "google-map/info-window",

    /**
     * View for each info-window
     * @property infoWindowViewClass
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowViewClass: "google-map/info-window",

    /**
     * Template for each info-window
     * @property infoWindowTemplateName
     * @type {String}
     * @default 'google-map/info-window'
     */
    infoWindowTemplateName: "google-map/info-window",

    /**
     * The google map object
     * @property map
     * @type {google.maps.Map}
     */
    map: oneWay("googleObject"),

    /**
     * Schedule an auto-fit of the bounds
     *
     * @method scheduleAutoFitBounds
     * @param {{sw: {lat: number, lng: number}, ne: {lat: number, lng: number}}|Array.<{lat: number, lng: number}>} [coords]
     */
    scheduleAutoFitBounds: function scheduleAutoFitBounds(coords) {
      Ember['default'].run.schedule("afterRender", this, function () {
        Ember['default'].run.debounce(this, "fitBoundsToContain", coords, 200);
      });
    },

    /**
     * Fit the bounds to contain given coordinates
     *
     * @method fitBoundsToContain
     * @param {{sw: {lat: number, lng: number}, ne: {lat: number, lng: number}}|Array.<{lat: number, lng: number}>} [coords]
     */
    fitBoundsToContain: function fitBoundsToContain(coords) {
      var map, bounds;
      if (this.isDestroying || this.isDestroyed || this._state !== "inDOM") {
        return;
      }
      map = this.get("googleObject");
      if (!map) {
        this.scheduleAutoFitBounds(coords);
        return;
      }
      if (coords == null) {
        coords = this.get("fitBoundsArray");
      }
      if (!coords) {
        return;
      }
      if (Ember['default'].isArray(coords)) {
        // it's an array of lat,lng
        coords = Ember['default'].A(coords);
        if (coords.get("length")) {
          bounds = new google.maps.LatLngBounds(helpers['default']._latLngToGoogle(coords.shiftObject()));
          coords.forEach(function (point) {
            bounds.extend(helpers['default']._latLngToGoogle(point));
          });
        }
      } else {
        // it's a bound object
        bounds = helpers['default']._boundsToGoogle(coords);
      }
      if (bounds) {
        // finally make our map to fit
        map.fitBounds(bounds);
      }
    },

    /**
     * Initialize the map
     */
    initGoogleMap: on("didInsertElement", function () {
      var canvas;
      this.destroyGoogleMap();
      if (helpers['default'].hasGoogleLib()) {
        canvas = this.$("div.map-canvas")[0];
        this.createGoogleObject(canvas, null);
        this.scheduleAutoFitBounds();
      }
    }),

    /**
     * Destroy the map
     */
    destroyGoogleMap: on("willDestroyElement", function () {
      if (this.get("googleObject")) {
        Ember['default'].debug(fmt("[google-map] destroying %@", this.get("googleName")));
        this.set("googleObject", null);
      }
    })
  });

  exports.MAP_TYPES = MAP_TYPES;
  exports.PLACE_TYPES = PLACE_TYPES;

});
define('ruhungry/controllers/cart', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var CartController = Ember['default'].ObjectController.extend({
		foodQuantity: 0,
		actions: {
			decrease: function decrease(item) {
				item.set("quantity", item.get("quantity") - 1);
				this.set("foodQuantity", this.get("foodQuantity") - 1);
				if (item.get("quantity") === 0) {
					item.deleteRecord();
					item.save();
				}
			},
			increase: function increase(item) {
				item.set("quantity", item.get("quantity") + 1);
				this.set("foodQuantity", this.get("foodQuantity") + 1);
			},
			checkout: function checkout() {
				this.transitionToRoute("payment");
			}
		}
	});

	exports['default'] = CartController;

});
define('ruhungry/controllers/createuser', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var CreateuserController = Ember['default'].ObjectController.extend({

        actions: {
            createUser: function createUser() {
                var userId = Date.now();
                var userData = {
                    id: userId,
                    name: Ember['default'].$("#new-name").val(),
                    email: Ember['default'].$("#new-email").val(),
                    address: Ember['default'].$("#new-address").val(),
                    zipCode: Ember['default'].$("#new-zip").val(),
                    password: Ember['default'].$("#new-pwd").val(),
                    status: true
                };
                console.log(userData);
                this.store.push("user", userData);
                this.transitionToRoute("login");
            }
        } });
    exports['default'] = CreateuserController;

});
define('ruhungry/controllers/discover', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var DiscoverController = Ember['default'].ArrayController.extend({
		queryParams: ["restaurantName", "zipcode"],
		needs: "search",
		restaurantName: Ember['default'].computed.alias("controllers.search.restaurantName"),
		zipcode: Ember['default'].computed.alias("controllers.search.zipcode"),

		actions: {
			search: function search() {
				this.set("restaurantName", "");
				this.set("zipcode", "");
				this.transitionToRoute("search");
			}
		},

		filterSearch: (function () {
			var restaurantName = this.get("restaurantName");
			var zipcode = this.get("zipcode");
			var restaurants = this.get("model");
			if (restaurantName || zipcode && zipcode !== "undefined") {
				if (restaurantName) {
					return restaurants.filterBy("name", restaurantName);
				} else {
					return restaurants.filterBy("zipCode", zipcode);
				}
			} else {
				return restaurants;
			}
		}).property("restaurantName", "zipcode", "model")
	});

	exports['default'] = DiscoverController;

});
define('ruhungry/controllers/google-map/circle', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('ruhungry/controllers/google-map/circles', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.circleController"),
    model: Ember['default'].computed.alias("parentController.circles")
  });

});
define('ruhungry/controllers/google-map/info-window', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('ruhungry/controllers/google-map/info-windows', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.infoWindowController"),
    model: Ember['default'].computed.alias("parentController.infoWindows")
  });

});
define('ruhungry/controllers/google-map/marker', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ObjectController.extend({});

});
define('ruhungry/controllers/google-map/markers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.markerController"),
    model: Ember['default'].computed.alias("parentController.markers")
  });

});
define('ruhungry/controllers/google-map/polygon-path', ['exports', 'ruhungry/controllers/google-map/polyline-path'], function (exports, GoogleMapPolylinePathController) {

	'use strict';

	exports['default'] = GoogleMapPolylinePathController['default'].extend({});

});
define('ruhungry/controllers/google-map/polygon', ['exports', 'ruhungry/controllers/google-map/polyline'], function (exports, GoogleMapPolylineController) {

	'use strict';

	exports['default'] = GoogleMapPolylineController['default'].extend({});

});
define('ruhungry/controllers/google-map/polygons', ['exports', 'ember', 'ruhungry/controllers/google-map/polylines'], function (exports, Ember, GoogleMapPolylinesController) {

  'use strict';

  exports['default'] = GoogleMapPolylinesController['default'].extend({
    itemController: Ember['default'].computed.alias("parentController.polygonController"),
    model: Ember['default'].computed.alias("parentController.polygons"),
    pathController: Ember['default'].computed.alias("parentController.polygonPathController")
  });

});
define('ruhungry/controllers/google-map/polyline-path', ['exports', 'ember', 'ember-google-map/mixins/google-array', 'ember-google-map/core/helpers'], function (exports, Ember, GoogleArrayMixin, helpers) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend(GoogleArrayMixin['default'], {
    model: Ember['default'].computed.alias("parentController.path"),
    googleItemFactory: helpers['default']._latLngToGoogle,
    emberItemFactory: function emberItemFactory(googleLatLng) {
      return Ember['default'].Object.create(helpers['default']._latLngFromGoogle(googleLatLng));
    },
    observeEmberProperties: ["lat", "lng"]
  });

});
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
define('ruhungry/controllers/google-map/polylines', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    itemController: Ember['default'].computed.alias("parentController.polylineController"),
    model: Ember['default'].computed.alias("parentController.polylines"),
    pathController: Ember['default'].computed.alias("parentController.polylinePathController")
  });

});
define('ruhungry/controllers/login', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var LoginController = Ember['default'].ObjectController.extend({
        name: "",
        address: "",
        actions: {

            save: function save() {

                var password = this.get("inputpassword");
                var email = this.get("inputemail");
                var validPassword = null;
                var self = this;

                this.store.find("user").then(function (users) {
                    users.forEach(function (user) {
                        console.log(user);
                        if (email === user.get("email")) {
                            validPassword = user.get("password");
                            if (password === validPassword) {
                                self.set("name", user.get("name"));
                                self.set("address", user.get("address"));
                                self.set("email", user.get("email"));
                                alert("Welcome Back!");
                                self.set("isLogged", true);
                                self.set("userID", user.get("id"));
                                self.transitionToRoute("sidemenu");
                            } else {
                                alert("Wrong password!");
                            }
                        }
                    });
                    if (!validPassword) {
                        alert("No such user!");
                    }
                });
            },

            newUser: function newUser() {
                this.transitionToRoute("createuser");
            },
            logout: function logout() {
                this.set("isLogged", false);
                alert("Thank you, Bye~");
                this.transitionToRoute("sidemenu");
            }
        } });
    exports['default'] = LoginController;

});
define('ruhungry/controllers/orderhistory', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var OrderhistoryController = Ember['default'].ArrayController.extend({});

	exports['default'] = OrderhistoryController;

});
define('ruhungry/controllers/payment', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var PaymentController = Ember['default'].ObjectController.extend({
		needs: ["login", "cart"],
		isLogged: Ember['default'].computed.alias("controllers.login.isLogged"),
		userID: Ember['default'].computed.alias("controllers.login.userID"),
		foodQuantity: Ember['default'].computed.alias("controllers.cart.foodQuantity"),
		isShowingPayment: false,
		isShowingAddress: false,
		isShowingError: false,
		cardName: "",
		cardNumber: "",
		stree: "",
		city: "",
		zipcode: "",
		phone: "",
		selectedTime: "11:30 AM -- 12:00 PM",
		availableDeliveryTime: ["11:30 AM -- 12:00 PM", "12:00 PM -- 12:30 PM", "12:30 PM -- 1:00 PM", "1:00 PM -- 1:30 PM", "1:30 PM -- 2:00 PM"],
		actions: {
			showPayment: function showPayment() {
				this.set("isShowingPayment", !this.get("isShowingPayment"));
			},
			showAddress: function showAddress() {
				this.set("isShowingAddress", !this.get("isShowingAddress"));
			},
			placeOrder: function placeOrder() {
				if (this.validateInformation()) {
					var order = this.store.createRecord("order", {});
					order.set("cardName", this.get("cardName")).set("cardNumber", this.get("cardNumber")).set("street", this.get("street")).set("city", this.get("city")).set("zipcode", this.get("zipcode")).set("phoneNumber", this.get("phone")).set("deliveryTime", this.get("selectedTime")).set("amount", this.get("totalAmount")).set("tax", this.get("tax")).set("totalAmount", this.get("total")).set("date", new Date());
					var restaurants = this.get("model").get("restaurantsList").copy();
					order.set("restaurants", restaurants);
					console.log(order.get("restaurants"));
					this.store.find("user", this.get("userID")).then(function (result) {
						order.set("user", result);
						order.save();
					});
					this.set("cardName", "").set("cardNumber", "").set("street", "").set("city", "").set("zipcode", "").set("phone", "").set("selectedTime", "").set("isShowingError", false).set("isShowingPayment", false).set("isShowingAddress", false);
					this.clearCart();
					this.transitionToRoute("order", order.id);
				} else {
					this.set("isShowingError", true);
				}
			}
		},

		tax: (function () {
			var amount = parseFloat(this.get("totalAmount").substring(1));
			var tax = amount * 0.0875;
			return "$" + tax.toFixed(2);
		}).property("model.totalAmount"),

		total: (function () {
			var amount = parseFloat(this.get("totalAmount").substring(1));
			var tax = parseFloat(this.get("tax").substring(1));
			var total = amount + tax;
			return "$" + total.toFixed(2);
		}).property("model.totalAmount"),

		validateInformation: function validateInformation() {
			if (this.get("cardName") === "" || this.get("cardNumber") === "" || this.get("street") === "" || this.get("city") === "" || this.get("zipcode") === "" || this.get("phone") === "") {
				return false;
			}
			return true;
		},
		clearCart: function clearCart() {
			this.store.find("food").then(function (res) {
				res.forEach(function (item) {
					item.deleteRecord();
					item.save();
				});
			});
			this.set("foodQuantity", 0);
		}
	});

	exports['default'] = PaymentController;

});
define('ruhungry/controllers/restaurant', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var RestaurantController = Ember['default'].ObjectController.extend({
		needs: ["login"],
		isLogged: Ember['default'].computed.alias("controllers.login.isLogged"),
		userID: Ember['default'].computed.alias("controllers.login.userID"),
		inputComment: "",
		foodDots: [],
		actions: {
			increaseImage: function increaseImage() {
				var len = this.get("foodGallery").length,
				    i = this.get("currentImageIndex");
				i++;
				this.set("currentImageIndex", i % len);
			},
			decreaseImage: function decreaseImage() {
				var len = this.get("foodGallery").length,
				    i = this.get("currentImageIndex");
				i--;
				if (i < 0) {
					i = i + len;
				}
				this.set("currentImageIndex", i % len);
			},
			showAddComment: function showAddComment() {
				this.set("isAddingComment", !this.get("isAddingComment"));
			},

			addComment: function addComment(param) {
				var isLogged = this.get("isLogged");
				if (this.get("inputComment") !== "") {
					var comment = this.store.createRecord("comment", {});
					comment.set("content", this.get("inputComment"));
					comment.set("restaurant", param);
					if (isLogged) {
						this.store.find("user", this.get("userID")).then(function (res) {
							comment.set("user", res);
							comment.save();
						});
					} else {
						this.store.find("user", "0").then(function (res) {
							comment.set("user", res);
							comment.save();
						});
					}

					this.set("inputComment", "");
				}
			}
		},
		dotsChange: (function () {
			var len = this.get("foodGallery").length,
			    currentImageIndex = this.get("currentImageIndex"),
			    dots = [];
			for (var i = 0; i < len; i++) {
				var dot = {};
				if (i === currentImageIndex) {
					dot.isCurrent = true;
				}
				dots.push(dot);
			}
			this.set("foodDots", dots);
		}).observes("currentImageIndex")
	});

	exports['default'] = RestaurantController;

});
define('ruhungry/controllers/restaurant/fullmenu', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var RestaurantFullmenuController = Ember['default'].ObjectController.extend({
		needs: ["cart"],
		foodQuantity: Ember['default'].computed.alias("controllers.cart.foodQuantity"),
		currentProperty: "",

		actions: {
			back: function back() {
				this.set("isNotFullmenu", true);
				this.transitionToRoute("restaurant");
			},
			selectCategory: function selectCategory(item) {
				this.set("currentCategory", this.get("content").get("formattedFoodMenu")[item.property]);
			},
			add: function add(item) {
				var number = this.get("foodQuantity") + 1;
				this.set("foodQuantity", number);
				var self = this;
				this.store.push("food", {
					id: item.foodID,
					name: item.foodName,
					price: item.foodPrice,
					restaurant: this.get("content")
				}).save().then(function (result) {
					result.set("quantity", result.get("quantity") + 1);
					self.store.find("cart", 0).then(function (res) {
						res.get("foods").pushObject(result);
					});
				});
			}
		},
		currentCategoryChange: function currentCategoryChange() {
			var foodCategory = this.get("foodCategory"),
			    currentProperty = this.get("currentProperty");
			for (var i = 0; i < foodCategory.length; i++) {
				if (foodCategory[i].property === currentProperty) {
					foodCategory[i].set("isCurrent", true);
				} else {
					foodCategory[i].set("isCurrent", false);
				}
			}
		}
	});

	exports['default'] = RestaurantFullmenuController;

});
define('ruhungry/controllers/search', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var SearchController = Ember['default'].Controller.extend({
		actions: {
			find: function find() {
				this.transitionToRoute("discover");
			}
		}
	});

	exports['default'] = SearchController;

});
define('ruhungry/controllers/sidemenu', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var SidemenuController = Ember['default'].ObjectController.extend({
		needs: "login",
		login: Ember['default'].computed.alias("controllers.login")

	});
	exports['default'] = SidemenuController;

});
define('ruhungry/initializers/app-version', ['exports', 'ruhungry/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('ruhungry/initializers/ember-cli-dates', ['exports', 'ember', 'ember-cli-dates/helpers/time-format', 'ember-cli-dates/helpers/time-ago-in-words', 'ember-cli-dates/helpers/day-of-the-week', 'ember-cli-dates/helpers/time-ahead-in-words', 'ember-cli-dates/helpers/time-delta-in-words', 'ember-cli-dates/helpers/month-and-year', 'ember-cli-dates/helpers/month-and-day', 'ember-cli-dates/helpers/date-and-time'], function (exports, Ember, time_format, time_ago_in_words, day_of_the_week, time_ahead_in_words, time_delta_in_words, month_and_year, month_and_day, date_and_time) {

  'use strict';

  var initialize = function initialize() {
    Ember['default'].Handlebars.helper("time-format", time_format.timeFormat);
    Ember['default'].Handlebars.helper("time-ago-in-words", time_ago_in_words.timeAgoInWords);
    Ember['default'].Handlebars.helper("day-of-the-week", day_of_the_week.dayOfTheWeek);
    Ember['default'].Handlebars.helper("time-ahead-in-words", time_ahead_in_words.timeAheadInWords);
    Ember['default'].Handlebars.helper("time-delta-in-words", time_delta_in_words.timeDeltaInWords);
    Ember['default'].Handlebars.helper("month-and-year", month_and_year.monthAndYear);
    Ember['default'].Handlebars.helper("month-and-day", month_and_day.monthAndDay);
    Ember['default'].Handlebars.helper("date-and-time", date_and_time.dateAndTime);
  };

  exports['default'] = {
    name: "ember-cli-dates",
    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});
define('ruhungry/initializers/ember-google-map', ['exports', 'ember-google-map/utils/load-google-map'], function (exports, loadGoogleMap) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.register("util:load-google-map", loadGoogleMap['default'], { instantiate: false });
    application.inject("route", "loadGoogleMap", "util:load-google-map");
  }

  exports['default'] = {
    name: "ember-google-map",
    initialize: initialize
  };

});
define('ruhungry/initializers/export-application-global', ['exports', 'ember', 'ruhungry/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('ruhungry/models/cart', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Cart = DS['default'].Model.extend({
		foods: DS['default'].hasMany("food"),

		restaurantsList: (function () {
			var foods = this.get("foods").currentState;
			var rests = [];
			for (var i = 0; i < foods.length; i++) {
				rests.push(foods[i].get("restaurant"));
			}
			rests = rests.uniq();
			var res = [];
			for (var j = 0; j < rests.length; j++) {
				var item = {};
				item.restaurantName = rests[j].get("name");
				item.food = foods.filterBy("restaurant", rests[j]);
				item.amount = 0;
				for (var k = 0; k < item.food.length; k++) {
					item.amount += parseFloat(item.food[k].get("price").substring(1)) * parseInt(item.food[k].get("quantity"));
				}
				item.amount = "$" + item.amount.toFixed(2);
				res.push(item);
			}
			return res;
		}).property("foods", "foods.@each.quantity"),

		totalAmount: (function () {
			var total = 0;
			var foods = this.get("foods").currentState;
			for (var i = 0; i < foods.length; i++) {
				total += parseFloat(foods[i].get("price").substring(1)) * parseInt(foods[i].get("quantity"));
			}
			return "$" + total.toFixed(2);
		}).property("foods", "foods.@each.quantity")
	});

	Cart.reopenClass({
		FIXTURES: [{
			id: 0,
			foods: []
		}]
	});

	exports['default'] = Cart;

});
define('ruhungry/models/comment', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Comment = DS['default'].Model.extend({
		content: DS['default'].attr("string"),
		user: DS['default'].belongsTo("user"),
		restaurant: DS['default'].belongsTo("restaurant", { async: true })
	});

	Comment.reopenClass({
		FIXTURES: [{
			id: "1",
			content: "Awesome hotpot and milktea!",
			user: "1",
			restaurant: "boilingpoint"
		}, {
			id: "2",
			content: "Best little hotpot in Bayarea!",
			user: "2",
			restaurant: "boilingpoint"
		}, {
			id: "3",
			content: "Their milktea is pretty good! My favorite is milk tea with honey boba.",
			user: "1",
			restaurant: "tpumps"
		}, {
			id: "4",
			content: "I like their peach green milk tea with honey boba.",
			user: "2",
			restaurant: "tpumps"
		}, {
			id: "5",
			content: "It is a new restaurant. The line out the door is very long!",
			user: "1",
			restaurant: "zensen"
		}, {
			id: "6",
			content: "Sushi are rotating on the belt!",
			user: "2",
			restaurant: "zensen"
		}, {
			id: "7",
			content: "It is a Hunan restaurant. Their food is very spicy!",
			user: "1",
			restaurant: "shaomountain"
		}, {
			id: "8",
			content: "One of the best Chinese restaurant in bay area!",
			user: "2",
			restaurant: "shaomountain"
		}]
	});

	exports['default'] = Comment;

});
define('ruhungry/models/food', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Food = DS['default'].Model.extend({
		name: DS['default'].attr("string"),
		price: DS['default'].attr("string"),
		quantity: DS['default'].attr("number", {
			defaultValue: 0
		}),
		restaurant: DS['default'].belongsTo("restaurant"),
		totalPrice: (function () {
			var price = this.get("price").substring(1),
			    quantity = this.get("quantity");
			return "$" + (parseFloat(price) * quantity).toFixed(2);
		}).property("price", "quantity")
	});

	Food.reopenClass({
		FIXTURES: [{
			id: "0",
			name: "Pudding",
			price: "$1.00",
			quantity: 2
		}, {
			id: "1",
			name: "Pudding",
			price: "$1.00",
			quantity: 2
		}]
	});

	exports['default'] = Food;

});
define('ruhungry/models/order', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var Order = DS['default'].Model.extend({
		cardName: DS['default'].attr("string"),
		cardNumber: DS['default'].attr("string"),
		street: DS['default'].attr("string"),
		city: DS['default'].attr("string"),
		zipcode: DS['default'].attr("string"),
		phoneNumber: DS['default'].attr("string"),
		deliveryTime: DS['default'].attr("string"),
		amount: DS['default'].attr("string"),
		tax: DS['default'].attr("string"),
		totalAmount: DS['default'].attr("string"),
		date: DS['default'].attr("date"),
		// restaurants: DS.attr(),
		status: DS['default'].attr("string", {
			defaultValue: "In Processing"
		}),
		user: DS['default'].belongsTo("user")
	});

	Order.reopenClass({
		FIXTURES: [{
			id: "10004",
			deliveryTime: "1:30 PM -- 2:00 PM",
			street: "500 El Camino Real",
			city: "Santa Clara, CA",
			zipcode: "95053",
			phoneNumber: "(650)611-0001",
			amount: "$30.05",
			tax: "$2.95",
			totalAmount: "$33.00",
			date: "03/17/2015"
		}]
	});

	exports['default'] = Order;

});
define('ruhungry/models/restaurant', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

	'use strict';

	var Restaurant = DS['default'].Model.extend({
		name: DS['default'].attr("string"),
		zipCode: DS['default'].attr("number"),
		city: DS['default'].attr("string"),
		openHours: DS['default'].attr("string"),
		acceptCreditCard: DS['default'].attr("string"),
		phone: DS['default'].attr("string"),
		website: DS['default'].attr("string"),
		address: DS['default'].attr("string"),
		type: DS['default'].attr("string"),
		foodGallery: DS['default'].attr(),
		foodMenu: DS['default'].attr(),
		lat: DS['default'].attr(),
		lng: DS['default'].attr(),
		comments: DS['default'].hasMany("comment"),

		restaurantImage: (function () {
			return "/images/%@.jpg".fmt(this.get("id"));
		}).property("id"),

		foodImage: (function () {
			var index = this.get("currentImageIndex");
			return "/images/%@/%@.jpg".fmt(this.get("id"), this.get("foodGallery")[index]);
		}).property("id", "foodGallery", "currentImageIndex"),

		foodCategory: (function () {
			var keys = Ember['default'].keys(this.get("foodMenu")),
			    category = [];
			for (var i = 0; i < keys.length; i++) {
				var item = {};
				item.property = keys[i];
				if (i === 0) {
					item.isCurrent = true;
				} else {
					item.isCurrent = false;
				}
				category.push(item);
			}
			return category;

			// return Ember.keys(this.get('foodMenu'));
		}).property("foodMenu"),

		formattedFoodMenu: (function () {
			var menu = {};
			for (var i = 0; i < this.get("foodCategory").length; i++) {
				var category = this.get("foodCategory")[i].property;
				menu[category] = [];
				for (var j = 0; j < this.get("foodMenu")[category].length; j++) {
					var temp = this.get("foodMenu")[category][j];
					var item = {};
					item.foodID = temp.foodID;
					item.foodName = temp.foodName;
					item.foodPrice = "$" + temp.price.toFixed(2);
					item.icon = "/images/%@/menu/%@.jpg".fmt(this.get("id"), temp.foodID);
					menu[category].push(item);
				}
			}
			return menu;
		}).property("foodMenu", "foodCategory", "id")
	});

	Restaurant.reopenClass({
		FIXTURES: [{
			id: "boilingpoint",
			name: "Boiling Point",
			zipCode: "94538",
			city: "Fremont, CA",
			openHours: "11:00 PM -- 11:00 PM",
			acceptCreditCard: "Visa/Mastercard/Discover",
			phone: "(510)498-8896",
			website: "http://www.bpgroupusa.com",
			address: "46807 Warm Springs Blvd, Fremont, CA 94538",
			type: "Taiwanese, Hotpot, Milktea",
			foodGallery: ["milktea", "macaron", "hotpot", "snowcube"],
			lat: 37.488955,
			lng: -121.9284261,
			foodMenu: {
				hotpot: [{
					foodID: "housespecial",
					foodName: "House Special",
					price: 12.95
				}, {
					foodID: "seafood",
					foodName: "Seafood&Tofu",
					price: 13.95
				}, {
					foodID: "beef",
					foodName: "Beef",
					price: 13.95
				}, {
					foodID: "kimchi",
					foodName: "Korean Kimchi",
					price: 11.95
				}],
				drink: [{
					foodID: "hokkaido",
					foodName: "Hokkaido Milk Tea",
					price: 3.5
				}, {
					foodID: "juice",
					foodName: "Strawberry Juice",
					price: 5
				}, {
					foodID: "smoothie",
					foodName: "Readbean Smoothie",
					price: 4
				}],
				dessert: [{
					foodID: "strawberry",
					foodName: "Strawberry Macaron",
					price: 2.5
				}, {
					foodID: "vanilla",
					foodName: "Vanilla Macaron",
					price: 2.5
				}, {
					foodID: "macha",
					foodName: "Macha Macaron",
					price: 2.5
				}]
			}
		}, {
			id: "tpumps",
			name: "Tpumps",
			zipCode: "95014",
			city: "Cupertino, CA",
			openHours: "11:00 PM -- 9:00 PM",
			acceptCreditCard: "Visa/Mastercard",
			phone: "(650)548-1085",
			website: "http://www.tpumps.com",
			address: "19959 Stevens Creek Blvd, Cupertino, CA 95014",
			type: "Tea, Milktea",
			foodGallery: ["fruittea", "milktea", "menu"],
			lat: 37.323239,
			lng: -122.022867,
			foodMenu: {
				milktea: [{
					foodID: "milktea",
					foodName: "Original Milk Tea",
					price: 2.75
				}, {
					foodID: "peach",
					foodName: "Peach Milk Tea",
					price: 3.25
				}, {
					foodID: "honeydew",
					foodName: "HoneyDew Milk Tea",
					price: 3.25
				}, {
					foodID: "taro",
					foodName: "Taro Milk Tea",
					price: 3.25
				}],
				tea: [{
					foodID: "passiontea",
					foodName: "Passion Fruit Tea",
					price: 2.5
				}, {
					foodID: "mangotea",
					foodName: "Mango Tea",
					price: 2.5
				}, {
					foodID: "strawberrytea",
					foodName: "Strawberry Tea",
					price: 2.5
				}]
			}
		}, {
			id: "zensen",
			name: "ZENSEN Sushi Express",
			zipCode: "94560",
			city: "Newark, CA",
			openHours: "11:30 AM -- 9:30 PM",
			acceptCreditCard: "Visa/Mastercard/AMEX",
			phone: "(510) 797-3500",
			website: "http://www.sushiexpress.us",
			address: "35233 Newark Blvd, Ste A, Newark, CA 94560",
			type: "Japanese, Sushi",
			foodGallery: ["sushi", "belt", "teabag"],
			lat: 37.547336,
			lng: -122.045729,
			foodMenu: {
				sushi: [{
					foodID: "salmon",
					foodName: "Salmon Sushi",
					price: 1.5
				}, {
					foodID: "squid",
					foodName: "Squid Sushi",
					price: 1.5
				}, {
					foodID: "spicytuna",
					foodName: "Spicy Tuna Sushi",
					price: 1.5
				}, {
					foodID: "squid",
					foodName: "Squid Sushi",
					price: 1.5
				}],
				dessert: [{
					foodID: "coconutpudding",
					foodName: "Coconut Pudding",
					price: 2.25
				}, {
					foodID: "mangopudding",
					foodName: "Mango Pudding",
					price: 2.25
				}, {
					foodID: "greenteacake",
					foodName: "Green Tea Cheese Cake",
					price: 2.25
				}]
			}
		}, {
			id: "shaomountain",
			name: "Shao Mountain",
			zipCode: "94538",
			city: "Fremont, CA",
			openHours: "11:00 AM -- 2:30 PM\t5:00 PM -- 9:30 PM",
			acceptCreditCard: "Visa/Mastercard",
			phone: "(510) 656-1638",
			website: "http://www.yelp.com/biz/shao-mountain-fremont",
			address: "43749 Boscell Rd, Fremont, CA 94538",
			type: "Chinese",
			foodGallery: ["lotus", "seafood", "fish"],
			lat: 37.4982938,
			lng: -121.9741617,
			foodMenu: {
				appetizer: [{
					foodID: "fuqifeipian",
					foodName: "Beef and Beef Offal",
					price: 6.75
				}, {
					foodID: "liangfen",
					foodName: "Bean Jelly",
					price: 5.75
				}],
				meat: [{
					foodID: "huiguorou",
					foodName: "Twice Cooked Pork",
					price: 12.5
				}, {
					foodID: "fish",
					foodName: "Dual Style Fish",
					price: 15.5
				}, {
					foodID: "porkrib",
					foodName: "Pork Ribs in Clay Pot",
					price: 13.5
				}],
				maincourse: [{
					foodID: "rice",
					foodName: "Rice",
					price: 1
				}, {
					foodID: "chaoshou",
					foodName: "Spicy Wonton",
					price: 6.5
				}, {
					foodID: "brownrice",
					foodName: "Brown Rice",
					price: 2
				}]
			}
		}]
	});

	exports['default'] = Restaurant;

});
define('ruhungry/models/user', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	var User = DS['default'].Model.extend({
		name: DS['default'].attr("string"),
		email: DS['default'].attr("string"),
		address: DS['default'].attr("string"),
		zipCode: DS['default'].attr("string"),
		comments: DS['default'].hasMany("comment", { async: true }),
		password: DS['default'].attr("string")

	});

	User.reopenClass({
		FIXTURES: [{
			id: "0",
			name: "Guest" }, {
			id: "1",
			name: "Su",
			email: "su@scu.edu",
			address: "500 El Camino Real, Santa Clara, CA",
			zipCode: "95053",
			password: "sususu",
			status: false

		}, {
			id: "2",
			name: "Fay",
			email: "fay@scu.edu",
			address: "500 ElCamino Real, Santa Clara, CA",
			zipCode: "95053",
			password: "huihui",
			status: false
		}]

	});

	exports['default'] = User;

});
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
define('ruhungry/routes/account', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var AccountRoute = Ember['default'].Route.extend({
    controllerName: "login",
    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model);
    },
    actions: {
      toggleAddressDiv: function toggleAddressDiv() {
        Ember['default'].$("#address-div").toggleClass("hide");
      },
      togglePaymentDiv: function togglePaymentDiv() {
        Ember['default'].$("#payment-div").toggleClass("hide");
      },
      toggleContactDiv: function toggleContactDiv() {
        Ember['default'].$("#contact-div").toggleClass("hide");
      } }
  });

  exports['default'] = AccountRoute;

});
define('ruhungry/routes/cart', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var CartRoute = Ember['default'].Route.extend({
		model: function model() {
			return this.store.find("cart", 0);
		},
		setupController: function setupController(controller, model) {
			controller.set("content", model);
			//					.set('foodQuantity', 0);      
		}
	});

	exports['default'] = CartRoute;

});
define('ruhungry/routes/createuser', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var CreateuserRoute = Ember['default'].Route.extend({

    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model);
    } });

  exports['default'] = CreateuserRoute;

});
define('ruhungry/routes/discover', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var DiscoverRoute = Ember['default'].Route.extend({
		model: function model() {
			this.store.find("user");
			this.store.find("comment");
			return this.store.find("restaurant");
		}
	});

	exports['default'] = DiscoverRoute;

});
define('ruhungry/routes/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var IndexRoute = Ember['default'].Route.extend({
    beforeModel: function beforeModel() {
      this.transitionTo("search");
    }
  });

  exports['default'] = IndexRoute;

});
define('ruhungry/routes/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var LoginRoute = Ember['default'].Route.extend({

    model: function model() {
      return this.store.find("user");
    },
    setupController: function setupController(controller, model) {
      controller.set("content", model).set("isLogged", false).set("userID", "0");
    } });

  exports['default'] = LoginRoute;

});
define('ruhungry/routes/order', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var OrderRoute = Ember['default'].Route.extend({
		model: function model(param) {
			return this.store.find("order", param.order_id);
		}
	});

	exports['default'] = OrderRoute;

});
define('ruhungry/routes/orderhistory', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var OrderhistoryRoute = Ember['default'].Route.extend({
		model: function model() {
			return this.store.find("order");
		},
		setupController: function setupController(controller, model) {
			controller.set("content", model);
		} });

	exports['default'] = OrderhistoryRoute;

});
define('ruhungry/routes/payment', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var PaymentRoute = Ember['default'].Route.extend({
		beforeModel: function beforeModel() {
			if (!this.controllerFor("login").get("isLogged")) {
				this.transitionTo("login");
			}
		},

		model: function model() {
			this.store.find("user");
			return this.store.find("cart", 0);
		}
	});

	exports['default'] = PaymentRoute;

});
define('ruhungry/routes/restaurant', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var RestaurantRoute = Ember['default'].Route.extend({
		model: function model(param) {
			this.store.find("user");
			this.store.find("comment");
			return this.store.find("restaurant", param.restaurant_id);
		},
		setupController: function setupController(controller, model) {
			controller.set("content", model).set("isNotFullmenu", true).set("isAddingComment", false).set("currentImageIndex", 0);
		}
	});

	exports['default'] = RestaurantRoute;

});
define('ruhungry/routes/restaurant/fullmenu', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	var RestaurantFullmenuRoute = Ember['default'].Route.extend({
			setupController: function setupController(controller, model) {
					var property = model.get("foodCategory")[0].property;
					controller.set("content", model).set("isNotFullmenu", false).set("currentCategory", model.get("formattedFoodMenu")[property]);
			}
	});

	exports['default'] = RestaurantFullmenuRoute;

});
define('ruhungry/routes/search', ['exports', 'ember'], function (exports, Ember) {

   'use strict';

   var SearchRoute = Ember['default'].Route.extend({
      setupController: function setupController(controller) {
         controller.set("restaurantName", "").set("zipcode");
      }
   });

   exports['default'] = SearchRoute;

});
define('ruhungry/templates/account', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	 ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","menu glyphicon glyphicon-menu-hamburger");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","account-page");
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Account");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","brief-info");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","avatar");
        var el3 = dom.createElement("img");
        dom.setAttribute(el3,"src","images/avatar_eli.jpg");
        dom.setAttribute(el3,"alt","avatar");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","info");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n	");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","name");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n	");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","email");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","what-to-do");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("My Address");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","glyphicon glyphicon-menu-right");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","address-div");
        dom.setAttribute(el2,"class","hide");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("My Payment Method");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","glyphicon glyphicon-menu-right");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","payment-div");
        dom.setAttribute(el2,"class","hide");
        var el3 = dom.createTextNode("ONLY Visa/Mastercard/Discover/AMEX");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createTextNode("Contact Us");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","glyphicon glyphicon-menu-right");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","contact-div");
        dom.setAttribute(el2,"class","hide");
        var el3 = dom.createTextNode("Contact us by Email:admin@ruhungry.com");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","logout");
        var el2 = dom.createTextNode("Log Out");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, content = hooks.content, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [3, 3, 1]);
        var element1 = dom.childAt(fragment, [5]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element1, [5]);
        var element4 = dom.childAt(element1, [9]);
        var element5 = dom.childAt(fragment, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),-1,-1);
        var morph3 = dom.createMorphAt(dom.childAt(element1, [3]),-1,-1);
        block(env, morph0, context, "link-to", ["sidemenu"], {}, child0, null);
        content(env, morph1, context, "name");
        content(env, morph2, context, "email");
        element(env, element2, context, "action", ["toggleAddressDiv"], {});
        content(env, morph3, context, "address");
        element(env, element3, context, "action", ["togglePaymentDiv"], {});
        element(env, element4, context, "action", ["toggleContactDiv"], {});
        element(env, element5, context, "action", ["logout"], {});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/cart', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("<");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("					");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","food-detail");
            var el2 = dom.createTextNode("\n						");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n						");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            var el3 = dom.createTextNode("\n						");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("p");
            dom.setAttribute(el3,"class","food-name");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n						");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("p");
            dom.setAttribute(el3,"class","food-price");
            var el4 = dom.createTextNode(" /each");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n						");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n					");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            var el3 = dom.createTextNode("\n						");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("button");
            dom.setAttribute(el3,"class","btn btn-primary btn-xs glyphicon glyphicon-minus");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n						");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("button");
            dom.setAttribute(el3,"class","btn btn-primary btn-xs glyphicon glyphicon-plus");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n					");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n					");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var element2 = dom.childAt(element0, [5]);
            var element3 = dom.childAt(element2, [1]);
            var element4 = dom.childAt(element2, [3]);
            var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element1, [1]),-1,-1);
            var morph2 = dom.createMorphAt(dom.childAt(element1, [3]),-1,0);
            content(env, morph0, context, "item.quantity");
            content(env, morph1, context, "item.name");
            content(env, morph2, context, "item.price");
            element(env, element3, context, "action", ["decrease", get(env, context, "item")], {});
            element(env, element4, context, "action", ["increase", get(env, context, "item")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","each-total");
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createElement("span");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" | ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("Total Amount: ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("                 \n				");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var element5 = dom.childAt(fragment, [1, 1]);
          var morph0 = dom.createMorphAt(dom.childAt(element5, [0]),-1,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element5, [2]),0,-1);
          var morph2 = dom.createMorphAt(fragment,2,3,contextualElement);
          content(env, morph0, context, "restaurant.restaurantName");
          content(env, morph1, context, "restaurant.amount");
          block(env, morph2, context, "each", [get(env, context, "restaurant.food")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","cart-page");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("SHOPPING CART");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n     ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","amount-summary");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n     ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("footer");
        var el3 = dom.createTextNode("\n    	");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-primary btn-lg btn-block");
        var el4 = dom.createTextNode("Check Out Now | ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, element = hooks.element, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element6 = dom.childAt(fragment, [0]);
        var element7 = dom.childAt(element6, [5, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element6, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element6, [3, 1, 1]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element7, [1]),-1,-1);
        block(env, morph0, context, "link-to", ["discover"], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "restaurantsList")], {"keyword": "restaurant"}, child1, null);
        element(env, element7, context, "action", ["checkout"], {});
        content(env, morph2, context, "totalAmount");
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/components/google-map', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["google-map/info-window"], {"context": get(env, context, "marker")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode(" @ ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(",");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,-1,0);
          var morph1 = dom.createMorphAt(element0,0,1);
          var morph2 = dom.createMorphAt(element0,1,-1);
          var morph3 = dom.createMorphAt(fragment,2,3,contextualElement);
          content(env, morph0, context, "marker.title");
          content(env, morph1, context, "marker.lat");
          content(env, morph2, context, "marker.lng");
          block(env, morph3, context, "if", [get(env, context, "view.hasInfoWindow")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "view", [get(env, context, "infoWindowViewClass")], {"context": get(env, context, "iw")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","map-canvas");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"style","display: none;");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [5]),0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element1, [7]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element1, [9]),0,1);
        block(env, morph0, context, "each", [get(env, context, "_markers")], {"itemViewClass": get(env, context, "markerViewClass"), "keyword": "marker"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "_infoWindows")], {"keyword": "iw"}, child1, null);
        inline(env, morph2, context, "each", [get(env, context, "_polylines")], {"itemViewClass": get(env, context, "polylineViewClass"), "keyword": "polyline"});
        inline(env, morph3, context, "each", [get(env, context, "_polygons")], {"itemViewClass": get(env, context, "polygonViewClass"), "keyword": "polygon"});
        inline(env, morph4, context, "each", [get(env, context, "_circles")], {"itemViewClass": get(env, context, "circleViewClass"), "keyword": "circle"});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/createuser', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","container");
        var el1 = dom.createTextNode("\n  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"role","form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","new-name");
        var el4 = dom.createTextNode("Name");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3,"type","text");
        dom.setAttribute(el3,"class","form-control");
        dom.setAttribute(el3,"id","new-name");
        dom.setAttribute(el3,"placeholder","Enter name");
        dom.setAttribute(el3,"required","");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","new-email");
        var el4 = dom.createTextNode("Email:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3,"type","email");
        dom.setAttribute(el3,"class","form-control");
        dom.setAttribute(el3,"id","new-email");
        dom.setAttribute(el3,"placeholder","Enter email");
        dom.setAttribute(el3,"required","");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","new-address");
        var el4 = dom.createTextNode("Address:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3,"type","text");
        dom.setAttribute(el3,"class","form-control");
        dom.setAttribute(el3,"id","new-address");
        dom.setAttribute(el3,"placeholder","Enter address");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","new-zip");
        var el4 = dom.createTextNode("Zip code:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3,"type","text");
        dom.setAttribute(el3,"class","form-control");
        dom.setAttribute(el3,"id","new-zip");
        dom.setAttribute(el3,"placeholder","Enter Zip");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","new-pwd");
        var el4 = dom.createTextNode("Password:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3,"type","password");
        dom.setAttribute(el3,"class","form-control");
        dom.setAttribute(el3,"id","new-pwd");
        dom.setAttribute(el3,"placeholder","Enter password");
        dom.setAttribute(el3,"required","");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("Submit");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        element(env, element0, context, "action", ["createUser"], {"on": "submit"});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/discover', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","menu glyphicon glyphicon-menu-hamburger");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","cart glyphicon glyphicon-shopping-cart");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","not-found");
          var el2 = dom.createTextNode("Sorry, No Restaurants Found!");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("img");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, element = hooks.element;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var element0 = dom.childAt(fragment, [1]);
              element(env, element0, context, "bind-attr", [], {"src": get(env, context, "restaurant.restaurantImage")});
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("section");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("div");
            dom.setAttribute(el3,"class","restaurant-name");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("div");
            dom.setAttribute(el3,"class","distance");
            var el4 = dom.createTextNode("5.3 mile");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n                ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("div");
            dom.setAttribute(el3,"class","type");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("                       \n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [1]);
            var element2 = dom.childAt(element1, [2]);
            var morph0 = dom.createMorphAt(element1,0,1);
            var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),-1,-1);
            var morph2 = dom.createMorphAt(dom.childAt(element2, [5]),-1,-1);
            block(env, morph0, context, "link-to", ["restaurant", get(env, context, "restaurant")], {}, child0, null);
            content(env, morph1, context, "restaurant.name");
            content(env, morph2, context, "restaurant.type");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "each", [get(env, context, "filterSearch")], {"keyword": "restaurant"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","discover-page");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Discover");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","search glyphicon glyphicon-search");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, element = hooks.element, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [1, 1]);
        var element4 = dom.childAt(element3, [4]);
        var morph0 = dom.createMorphAt(element3,0,1);
        var morph1 = dom.createMorphAt(element3,5,6);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
        block(env, morph0, context, "link-to", ["sidemenu"], {}, child0, null);
        element(env, element4, context, "action", ["search"], {});
        block(env, morph1, context, "link-to", ["cart"], {}, child1, null);
        block(env, morph2, context, "unless", [get(env, context, "filterSearch")], {}, child2, child3);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/gallery', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("•");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "bind-attr", [], {"class": "dot.isCurrent"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","food-gallery");
        dom.setAttribute(el0,"on","swipeLeft swipeRight");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","glyphicon glyphicon-menu-left arrow");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("img");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","indicator-dots");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode(" \n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1,"class","glyphicon glyphicon-menu-right arrow");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [1]);
        var element2 = dom.childAt(fragment, [3]);
        var element3 = dom.childAt(fragment, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [5]),0,1);
        element(env, element1, context, "action", ["decreaseImage"], {});
        element(env, element2, context, "bind-attr", [], {"src": get(env, context, "foodImage")});
        block(env, morph0, context, "each", [get(env, context, "foodDots")], {"keyword": "dot"}, child0, null);
        element(env, element3, context, "action", ["increaseImage"], {});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/google-map/info-window', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        dom.setAttribute(el1,"style","margin-top: 0;");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        dom.setAttribute(el1,"style","margin-bottom: 0;");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),-1,-1);
        content(env, morph0, context, "title");
        content(env, morph1, context, "description");
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/google-map/polyline', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode(",");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,-1,0);
          var morph1 = dom.createMorphAt(element0,0,-1);
          content(env, morph0, context, "point.lat");
          content(env, morph1, context, "point.lng");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,-1);
        block(env, morph0, context, "each", [get(env, context, "_path")], {"keyword": "point"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	 ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-menu-left");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","login-page");
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Log In");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","signin");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","welcome");
        var el3 = dom.createTextNode("Welcome Back!");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","sign");
        var el3 = dom.createTextNode("SIGN IN WITH YOUR EMAIL TO ORDER DELIVERY");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","input");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","input ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","input");
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-success");
        var el4 = dom.createTextNode("Log In");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","input");
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-primary");
        var el4 = dom.createTextNode("Create User");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [3]);
        var element1 = dom.childAt(element0, [9, 0]);
        var element2 = dom.childAt(element0, [11, 0]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [7]),-1,-1);
        block(env, morph0, context, "link-to", ["sidemenu"], {}, child0, null);
        inline(env, morph1, context, "input", [], {"placeholder": "Email", "value": get(env, context, "inputemail")});
        inline(env, morph2, context, "input", [], {"placeholder": "Password", "type": "password", "value": get(env, context, "inputpassword")});
        element(env, element1, context, "action", ["save"], {});
        element(env, element2, context, "action", ["newUser"], {});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/order', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("ul");
            var el2 = dom.createTextNode("\n					");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("li");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n					");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("li");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n					");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("li");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n				");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),-1,-1);
            var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
            content(env, morph0, context, "item.name");
            content(env, morph1, context, "item.quantity");
            content(env, morph2, context, "item.totalPrice");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","res-name");
          var el2 = dom.createTextNode(":  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element1,-1,0);
          var morph1 = dom.createMorphAt(element1,0,-1);
          var morph2 = dom.createMorphAt(fragment,2,3,contextualElement);
          content(env, morph0, context, "restaurant.restaurantName");
          content(env, morph1, context, "restaurant.amount");
          block(env, morph2, context, "each", [get(env, context, "restaurant.food")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Go to HomePage");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","order-page");
        var el1 = dom.createTextNode("\n	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("Order Confirmation");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h5");
        var el3 = dom.createTextNode("Thank you for your order");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        dom.setAttribute(el2,"class","del-time");
        var el3 = dom.createTextNode("You Order will be delivered During: ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Shipping Adress");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode(", ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Phone: ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","order");
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Order Detail");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("		");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","amount");
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","label");
        var el5 = dom.createTextNode("Subtotal: ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","price");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","label");
        var el5 = dom.createTextNode("Tax: ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","price");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","label");
        var el5 = dom.createTextNode("Total: ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        dom.setAttribute(el4,"class","price");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n	");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("footer");
        var el2 = dom.createTextNode("\n		 ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-primary btn-lg btn-block");
        var el3 = dom.createTextNode("\n		 	");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		 ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [3]);
        var element3 = dom.childAt(element2, [5]);
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element2, [9]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [3]),0,-1);
        var morph1 = dom.createMorphAt(element4,-1,0);
        var morph2 = dom.createMorphAt(element4,0,1);
        var morph3 = dom.createMorphAt(element4,1,-1);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [5]),0,-1);
        var morph5 = dom.createMorphAt(dom.childAt(element2, [7]),2,3);
        var morph6 = dom.createMorphAt(dom.childAt(element5, [1, 2]),-1,-1);
        var morph7 = dom.createMorphAt(dom.childAt(element5, [3, 2]),-1,-1);
        var morph8 = dom.createMorphAt(dom.childAt(element5, [5, 2]),-1,-1);
        var morph9 = dom.createMorphAt(dom.childAt(fragment, [5, 1]),0,1);
        content(env, morph0, context, "deliveryTime");
        content(env, morph1, context, "street");
        content(env, morph2, context, "city");
        content(env, morph3, context, "zipcode");
        content(env, morph4, context, "phoneNumber");
        block(env, morph5, context, "each", [get(env, context, "restaurants")], {"keyword": "restaurant"}, child0, null);
        content(env, morph6, context, "amount");
        content(env, morph7, context, "tax");
        content(env, morph8, context, "totalAmount");
        block(env, morph9, context, "link-to", ["search"], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/orderhistory', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	 ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","menu glyphicon glyphicon-menu-hamburger");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [0]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),-1,-1);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
          inline(env, morph0, context, "time-format", [get(env, context, "foo.date"), "l"], {});
          content(env, morph1, context, "foo.totalAmount");
          content(env, morph2, context, "foo.status");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","order-history");
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("My Orders");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","detail");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","title");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Date");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("TotalAmount");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Status");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [3, 1]),2,-1);
        block(env, morph0, context, "link-to", ["sidemenu"], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "model")], {"keyword": "foo"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/payment', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("<");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","error");
          var el2 = dom.createTextNode("Please Enter All of the Information");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("HIDE    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("<");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("SHOW    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode(">");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","enter-area");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("Name On Card");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("Card Number");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),2,3);
          var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),2,3);
          inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "cardName"), "class": "form-control input-sm", "placeholder": "RUOFEI XIE"});
          inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "cardNumber"), "class": "form-control input-sm"});
          return fragment;
        }
      };
    }());
    var child5 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("HIDE    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode("<");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child6 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("SHOW    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          var el3 = dom.createTextNode(">");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child7 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","enter-area");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("Street");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("City");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("ZipCode");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","form-group");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("label");
          dom.setAttribute(el3,"class","control-label");
          var el4 = dom.createTextNode("Phone Number");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),2,3);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),2,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),2,3);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),2,3);
          inline(env, morph0, context, "input", [], {"type": "text", "value": get(env, context, "street"), "class": "form-control input-sm", "placeholder": "500 El Camino Real"});
          inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "city"), "class": "form-control input-sm", "placeholder": "Santa Clara, CA"});
          inline(env, morph2, context, "input", [], {"type": "text", "value": get(env, context, "zipcode"), "class": "form-control input-sm", "placeholder": "94085"});
          inline(env, morph3, context, "input", [], {"type": "tel", "value": get(env, context, "phone"), "class": "form-control input-sm", "placeholder": "(408)111-111"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","payment-page");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("header");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("Confirm Purchase");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","enter-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","enter-label");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Payment");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","enter-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","enter-label");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Address");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            \n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","delivery-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","delivery-time");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("CHOOSE DELIVERY TIME");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","amount-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","item");
        var el6 = dom.createTextNode("Subtotal:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","amount");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","item");
        var el6 = dom.createTextNode("State&Local Tax:");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","amount");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createElement("strong");
        var el7 = dom.createTextNode("Total:");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        dom.setAttribute(el5,"class","amount border");
        var el6 = dom.createElement("strong");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("footer");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-primary btn-lg btn-block");
        var el4 = dom.createTextNode("PLACE ORDER");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [4]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element2, [6]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element2, [10, 1]);
        var element8 = dom.childAt(element2, [12, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,1);
        var morph1 = dom.createMorphAt(element2,2,3);
        var morph2 = dom.createMorphAt(element4,2,3);
        var morph3 = dom.createMorphAt(element3,2,3);
        var morph4 = dom.createMorphAt(element6,2,3);
        var morph5 = dom.createMorphAt(element5,2,3);
        var morph6 = dom.createMorphAt(dom.childAt(element2, [8, 1]),2,3);
        var morph7 = dom.createMorphAt(dom.childAt(element7, [1, 3]),-1,-1);
        var morph8 = dom.createMorphAt(dom.childAt(element7, [3, 3]),-1,-1);
        var morph9 = dom.createMorphAt(dom.childAt(element7, [5, 3, 0]),-1,-1);
        block(env, morph0, context, "link-to", ["cart"], {}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "isShowingError")], {}, child1, null);
        element(env, element4, context, "action", ["showPayment"], {});
        block(env, morph2, context, "if", [get(env, context, "isShowingPayment")], {}, child2, child3);
        block(env, morph3, context, "if", [get(env, context, "isShowingPayment")], {}, child4, null);
        element(env, element6, context, "action", ["showAddress"], {});
        block(env, morph4, context, "if", [get(env, context, "isShowingAddress")], {}, child5, child6);
        block(env, morph5, context, "if", [get(env, context, "isShowingAddress")], {}, child7, null);
        inline(env, morph6, context, "view", ["select"], {"class": "form-control", "content": get(env, context, "availableDeliveryTime"), "value": get(env, context, "selectedTime")});
        content(env, morph7, context, "totalAmount");
        content(env, morph8, context, "tax");
        content(env, morph9, context, "total");
        element(env, element8, context, "action", ["placeOrder"], {});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/restaurant', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","back");
            var el2 = dom.createTextNode(" < Back");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","cart glyphicon glyphicon-shopping-cart");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("p");
            var el2 = dom.createTextNode(": ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element2 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element2,-1,0);
            var morph1 = dom.createMorphAt(element2,0,-1);
            content(env, morph0, context, "comment.user.name");
            content(env, morph1, context, "comment.content");
            return fragment;
          }
        };
      }());
      var child3 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("		");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","comment-adding");
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"class","btn btn-primary btn-xs");
            var el3 = dom.createTextNode("Submit");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n		");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [2]);
            var morph0 = dom.createMorphAt(element0,0,1);
            inline(env, morph0, context, "textarea", [], {"class": "form-control", "value": get(env, context, "inputComment")});
            element(env, element1, context, "action", ["addComment", get(env, context, "this")], {});
            return fragment;
          }
        };
      }());
      var child4 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createTextNode("FULL MENU");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"id","restaurant-page");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("header");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("nav");
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("div");
          dom.setAttribute(el4,"class","zipcode");
          var el5 = dom.createTextNode("\n                ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("p");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n                ");
          dom.appendChild(el4, el5);
          var el5 = dom.createElement("p");
          dom.appendChild(el4, el5);
          var el5 = dom.createTextNode("\n            ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("section");
          dom.setAttribute(el2,"class","restaurant-intro");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("p");
          dom.setAttribute(el4,"class","restaurant-name");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("p");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("p");
          var el5 = dom.createTextNode("TODAY: ");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("section");
          dom.setAttribute(el2,"class","information");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Information");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Accept Credit Card: ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Phone: ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n		");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Website: ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("a");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          dom.setAttribute(el3,"class","location");
          var el4 = dom.createTextNode("Location: ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("section");
          dom.setAttribute(el2,"class","comments");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","glyphicon glyphicon-plus");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createTextNode("Comments");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("footer");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("nav");
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n        ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n    ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block, content = hooks.content, inline = hooks.inline, get = hooks.get, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element3 = dom.childAt(fragment, [0]);
          var element4 = dom.childAt(element3, [1, 1]);
          var element5 = dom.childAt(element4, [2]);
          var element6 = dom.childAt(element3, [3]);
          var element7 = dom.childAt(element6, [2]);
          var element8 = dom.childAt(element3, [5]);
          var element9 = dom.childAt(element8, [7, 1]);
          var element10 = dom.childAt(element3, [7]);
          if (this.cachedFragment) { dom.repairClonedNode(element10,[5]); }
          var element11 = dom.childAt(element10, [1]);
          var morph0 = dom.createMorphAt(element4,0,1);
          var morph1 = dom.createMorphAt(dom.childAt(element5, [1]),-1,-1);
          var morph2 = dom.createMorphAt(dom.childAt(element5, [3]),-1,-1);
          var morph3 = dom.createMorphAt(element4,3,4);
          var morph4 = dom.createMorphAt(element6,0,1);
          var morph5 = dom.createMorphAt(dom.childAt(element7, [1]),-1,-1);
          var morph6 = dom.createMorphAt(dom.childAt(element7, [3]),-1,-1);
          var morph7 = dom.createMorphAt(dom.childAt(element7, [5]),0,-1);
          var morph8 = dom.createMorphAt(dom.childAt(element8, [3]),0,-1);
          var morph9 = dom.createMorphAt(dom.childAt(element8, [5]),0,-1);
          var morph10 = dom.createMorphAt(element9,-1,-1);
          var morph11 = dom.createMorphAt(dom.childAt(element8, [9]),0,-1);
          var morph12 = dom.createMorphAt(element8,10,11);
          var morph13 = dom.createMorphAt(element10,4,5);
          var morph14 = dom.createMorphAt(element10,5,6);
          var morph15 = dom.createMorphAt(dom.childAt(element3, [9, 1]),0,1);
          block(env, morph0, context, "link-to", ["discover"], {}, child0, null);
          content(env, morph1, context, "zipCode");
          content(env, morph2, context, "city");
          block(env, morph3, context, "link-to", ["cart"], {}, child1, null);
          inline(env, morph4, context, "view", ["gallery"], {});
          content(env, morph5, context, "name");
          content(env, morph6, context, "type");
          content(env, morph7, context, "openHours");
          content(env, morph8, context, "acceptCreditCard");
          content(env, morph9, context, "phone");
          element(env, element9, context, "bind-attr", [], {"href": get(env, context, "website")});
          content(env, morph10, context, "website");
          content(env, morph11, context, "address");
          inline(env, morph12, context, "google-map", [], {"lat": get(env, context, "lat"), "lng": get(env, context, "lng"), "zoom": 17, "gopt_zoomControl": false, "type": "map"});
          element(env, element11, context, "action", ["showAddComment"], {});
          block(env, morph13, context, "each", [get(env, context, "comments")], {"keyword": "comment"}, child2, null);
          block(env, morph14, context, "if", [get(env, context, "isAddingComment")], {}, child3, null);
          block(env, morph15, context, "link-to", ["restaurant.fullmenu"], {}, child4, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1,2]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "isNotFullmenu")], {}, child0, null);
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/restaurant/fullmenu', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, get = hooks.get, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element4 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element4,-1,-1);
          element(env, element4, context, "bind-attr", [], {"class": "item.isCurrent"});
          element(env, element4, context, "action", ["selectCategory", get(env, context, "item")], {});
          content(env, morph0, context, "item.property");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("				");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","food-lists");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createElement("img");
          dom.setAttribute(el4,"class","img-rounded");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createElement("p");
          dom.setAttribute(el4,"class","foodname");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("p");
          dom.setAttribute(el4,"class","price");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                    ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("button");
          dom.setAttribute(el4,"class","btn btn-primary btn-sm");
          var el5 = dom.createTextNode("+ ADD");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          var element1 = dom.childAt(element0, [1, 0]);
          var element2 = dom.childAt(element0, [5]);
          var element3 = dom.childAt(element2, [3]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [3, 0]),-1,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),-1,-1);
          element(env, element1, context, "bind-attr", [], {"src": get(env, context, "item.icon")});
          content(env, morph0, context, "item.foodName");
          content(env, morph1, context, "item.foodPrice");
          element(env, element3, context, "action", ["add", get(env, context, "item")], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("GO TO CART");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","cart glyphicon glyphicon-shopping-cart");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","badge");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [5]),-1,-1);
          content(env, morph0, context, "foodQuantity");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","fullmenu-page");
        var el1 = dom.createTextNode("\n\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("header");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","hide-down");
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","glyphicon glyphicon-menu-down");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","text-center");
        var el4 = dom.createTextNode("FULL MENU");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","menu-category scroll-part-x");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","menu-detail");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","blank-area");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("footer");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [1, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [3, 1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [5, 1]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [7]),0,1);
        element(env, element5, context, "action", ["back"], {});
        block(env, morph0, context, "each", [get(env, context, "foodCategory")], {"keyword": "item"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "currentCategory")], {"keyword": "item"}, child1, null);
        block(env, morph2, context, "link-to", ["cart"], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/search', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("button");
          dom.setAttribute(el0,"class","navbar-toggle");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"id","search-page");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("RUHungry");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Dilicious Food Delivered Quickly");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","find-restaurant");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Your Zipcode");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("What Restaurant Would You Like?");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"class","btn btn-primary");
        var el4 = dom.createTextNode("Find");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [3, 5]);
        var element1 = dom.childAt(element0, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(element0,2,3);
        var morph2 = dom.createMorphAt(element0,5,6);
        block(env, morph0, context, "link-to", ["sidemenu"], {}, child0, null);
        inline(env, morph1, context, "input", [], {"type": "text", "value": get(env, context, "zipcode"), "placeholder": "95014", "class": "form-control input-sm"});
        inline(env, morph2, context, "input", [], {"type": "text", "value": get(env, context, "restaurantName"), "placeholder": "Tpumps", "class": "form-control input-sm"});
        element(env, element1, context, "action", ["find", get(env, context, "this")], {});
        return fragment;
      }
    };
  }()));

});
define('ruhungry/templates/sidemenu', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("li");
            var el2 = dom.createElement("span");
            dom.setAttribute(el2,"class","glyphicon glyphicon-cutlery");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("FOOD AND RESTAURANT");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("li");
            var el2 = dom.createElement("span");
            dom.setAttribute(el2,"class","glyphicon glyphicon-folder-open");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("ORDER HISTORY");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("li");
            var el2 = dom.createElement("span");
            dom.setAttribute(el2,"class","glyphicon glyphicon-user");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("ACCOUNT");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","side-menu-list");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.setAttribute(el2,"class","title");
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","glyphicon glyphicon-list-alt");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("MENU");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [0]);
          if (this.cachedFragment) { dom.repairClonedNode(element0,[3,4]); }
          var morph0 = dom.createMorphAt(element0,2,3);
          var morph1 = dom.createMorphAt(element0,3,4);
          var morph2 = dom.createMorphAt(element0,4,-1);
          block(env, morph0, context, "link-to", ["discover"], {}, child0, null);
          block(env, morph1, context, "link-to", ["orderhistory"], {}, child1, null);
          block(env, morph2, context, "link-to", ["account"], {}, child2, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createElement("span");
            dom.setAttribute(el0,"class","search glyphicon glyphicon-search back-to-search");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createElement("p");
            dom.setAttribute(el1,"class","loginlink");
            var el2 = dom.createTextNode("Click Here to Login");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"src","/images/login.jpeg");
          dom.setAttribute(el1,"class","img-responsive img-center");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","logintext");
          var el2 = dom.createTextNode("I know you are hungry,");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("but please Login first  ^_^");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[7]); }
          var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
          var morph1 = dom.createMorphAt(fragment,6,7,contextualElement);
          block(env, morph0, context, "link-to", ["search"], {}, child0, null);
          block(env, morph1, context, "link-to", ["login"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","side-menu");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,-1);
        block(env, morph0, context, "if", [get(env, context, "login.isLogged")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('ruhungry/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('ruhungry/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/cart.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/cart.js should pass jshint', function() { 
    ok(true, 'controllers/cart.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/createuser.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/createuser.js should pass jshint', function() { 
    ok(true, 'controllers/createuser.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/discover.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/discover.js should pass jshint', function() { 
    ok(true, 'controllers/discover.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/login.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/login.js should pass jshint', function() { 
    ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/orderhistory.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/orderhistory.js should pass jshint', function() { 
    ok(true, 'controllers/orderhistory.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/payment.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/payment.js should pass jshint', function() { 
    ok(true, 'controllers/payment.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/restaurant.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/restaurant.js should pass jshint', function() { 
    ok(true, 'controllers/restaurant.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/restaurant/fullmenu.jshint', function () {

  'use strict';

  module('JSHint - controllers/restaurant');
  test('controllers/restaurant/fullmenu.js should pass jshint', function() { 
    ok(true, 'controllers/restaurant/fullmenu.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/search.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/search.js should pass jshint', function() { 
    ok(true, 'controllers/search.js should pass jshint.'); 
  });

});
define('ruhungry/tests/controllers/sidemenu.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/sidemenu.js should pass jshint', function() { 
    ok(true, 'controllers/sidemenu.js should pass jshint.'); 
  });

});
define('ruhungry/tests/helpers/resolver', ['exports', 'ember/resolver', 'ruhungry/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('ruhungry/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('ruhungry/tests/helpers/start-app', ['exports', 'ember', 'ruhungry/app', 'ruhungry/router', 'ruhungry/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('ruhungry/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/cart.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/cart.js should pass jshint', function() { 
    ok(true, 'models/cart.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/comment.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/comment.js should pass jshint', function() { 
    ok(true, 'models/comment.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/food.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/food.js should pass jshint', function() { 
    ok(true, 'models/food.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/order.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/order.js should pass jshint', function() { 
    ok(true, 'models/order.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/restaurant.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/restaurant.js should pass jshint', function() { 
    ok(true, 'models/restaurant.js should pass jshint.'); 
  });

});
define('ruhungry/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('ruhungry/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/account.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/account.js should pass jshint', function() { 
    ok(true, 'routes/account.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/cart.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/cart.js should pass jshint', function() { 
    ok(true, 'routes/cart.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/createuser.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/createuser.js should pass jshint', function() { 
    ok(true, 'routes/createuser.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/discover.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/discover.js should pass jshint', function() { 
    ok(true, 'routes/discover.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/order.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/order.js should pass jshint', function() { 
    ok(true, 'routes/order.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/orderhistory.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/orderhistory.js should pass jshint', function() { 
    ok(true, 'routes/orderhistory.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/payment.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/payment.js should pass jshint', function() { 
    ok(true, 'routes/payment.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/restaurant.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/restaurant.js should pass jshint', function() { 
    ok(true, 'routes/restaurant.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/restaurant/fullmenu.jshint', function () {

  'use strict';

  module('JSHint - routes/restaurant');
  test('routes/restaurant/fullmenu.js should pass jshint', function() { 
    ok(true, 'routes/restaurant/fullmenu.js should pass jshint.'); 
  });

});
define('ruhungry/tests/routes/search.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/search.js should pass jshint', function() { 
    ok(true, 'routes/search.js should pass jshint.'); 
  });

});
define('ruhungry/tests/test-helper', ['ruhungry/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('ruhungry/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('ruhungry/tests/views/gallery.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/gallery.js should pass jshint', function() { 
    ok(true, 'views/gallery.js should pass jshint.'); 
  });

});
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
define('ruhungry/views/google-map/circle', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapCircleView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Circle",

    googleProperties: {
      isClickable: { name: "clickable", optionOnly: true },
      isVisible: { name: "visible", event: "visible_changed" },
      isDraggable: { name: "draggable", event: "draggable_changed" },
      isEditable: { name: "editable", event: "editable_changed" },
      radius: { event: "radius_changed", cast: helpers['default'].cast.number },
      strokeColor: { optionOnly: true },
      strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
      fillColor: { optionOnly: true },
      fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number },
      zIndex: { cast: helpers['default'].cast.integer, optionOnly: true },
      map: { readOnly: true },
      "lat,lng": {
        name: "center",
        event: "center_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    // aliased from controller so that if they are not defined they use the values from the controller
    radius: alias("controller.radius"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    isEditable: alias("controller.isEditable"),
    strokeColor: alias("controller.strokeColor"),
    strokeOpacity: alias("controller.strokeOpacity"),
    strokeWeight: alias("controller.strokeWeight"),
    fillColor: alias("controller.fillColor"),
    fillOpacity: alias("controller.fillOpacity"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng")
  });

});
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
define('ruhungry/views/google-map/info-window', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core', 'ruhungry/views/google-map/marker'], function (exports, Ember, helpers, GoogleMapCoreView, MarkerView) {

  'use strict';

  var observer = Ember['default'].observer;
  var on = Ember['default'].on;
  var scheduleOnce = Ember['default'].run.scheduleOnce;
  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  var any = computed.any;

  /**
   * @class GoogleMapInfoWindowView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    classNames: ["google-info-window"],

    googleFQCN: "google.maps.InfoWindow",

    // will be either the marker using us, or the component if this is a detached info-window
    templateName: any("controller.templateName", "parentView.infoWindowTemplateName"),

    googleProperties: {
      zIndex: { event: "zindex_changed", cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      "lat,lng": {
        name: "position",
        event: "position_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    isMarkerInfoWindow: computed("parentView", function () {
      return this.get("parentView") instanceof MarkerView['default'];
    }),

    googleMapComponent: computed("isMarkerInfoWindow", function () {
      return this.get(this.get("isMarkerInfoWindow") ? "parentView.parentView" : "parentView");
    }),

    _coreGoogleEvents: ["closeclick"],

    // aliased from controller so that if they are not defined they use the values from the controller
    zIndex: alias("controller.zIndex"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng"),
    anchor: oneWay("parentView.infoWindowAnchor"),

    visible: computed("parentView.isInfoWindowVisible", "controller.isVisible", function (key, value) {
      var isMarkerIW = this.get("isMarkerInfoWindow");
      if (arguments.length < 2) {
        if (isMarkerIW) {
          value = this.get("parentView.isInfoWindowVisible");
        } else {
          value = this.getWithDefault("controller.isVisible", true);
          this.set("controller.isVisible", value);
        }
      } else {
        if (isMarkerIW) {
          this.set("parentView.isInfoWindowVisible", value);
        } else {
          this.set("controller.isVisible", value);
        }
      }
      return value;
    }),

    initGoogleObject: on("didInsertElement", function () {
      scheduleOnce("afterRender", this, "_initGoogleInfoWindow");
    }),

    handleInfoWindowVisibility: observer("visible", function () {
      if (this._changingVisible) {
        return;
      }
      var iw = this.get("googleObject");
      if (iw) {
        if (this.get("visible")) {
          iw.open(this.get("map"), this.get("anchor") || undefined);
        } else {
          iw.close();
        }
      }
    }),

    _initGoogleInfoWindow: function _initGoogleInfoWindow() {
      // force the creation of the marker
      if (helpers['default'].hasGoogleLib() && !this.get("googleObject")) {
        this.createGoogleObject({ content: this._backupViewElement() });
        this.handleInfoWindowVisibility();
      }
    },

    destroyGoogleObject: on("willDestroyElement", function () {
      var infoWindow = this.get("googleObject");
      if (infoWindow) {
        this._changingVisible = true;
        infoWindow.close();
        // detach from the map
        infoWindow.setMap(null);
        // free the content node
        this._restoreViewElement();
        this.set("googleObject", null);
        this._changingVisible = false;
      }
    }),

    _backupViewElement: function _backupViewElement() {
      var element = this.get("element");
      if (!this._placeholderElement) {
        this._placeholderElement = document.createElement(element.nodeName);
        element.parentNode.replaceChild(this._placeholderElement, element);
      }
      return element;
    },

    _restoreViewElement: function _restoreViewElement() {
      var element = this.get("element");
      if (this._placeholderElement) {
        this._placeholderElement.parentNode.replaceChild(element, this._placeholderElement);
        this._placeholderElement = null;
      }
      return element;
    },

    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === "closeclick") {
        this._changingVisible = true;
        this.set("visible", false);
        this._changingVisible = false;
      }
    }
  });

});
define('ruhungry/views/google-map/marker', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var oneWay = computed.oneWay;
  /**
   * @class GoogleMapMarkerView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Marker",

    googleProperties: {
      isClickable: { name: "clickable", event: "clickable_changed" },
      isVisible: { name: "visible", event: "visible_changed" },
      isDraggable: { name: "draggable", event: "draggable_changed" },
      title: { event: "title_changed" },
      opacity: { cast: helpers['default'].cast.number },
      icon: { event: "icon_changed" },
      zIndex: { event: "zindex_changed", cast: helpers['default'].cast.integer },
      map: { readOnly: true },
      "lat,lng": {
        name: "position",
        event: "position_changed",
        toGoogle: helpers['default']._latLngToGoogle,
        fromGoogle: helpers['default']._latLngFromGoogle
      }
    },

    _coreGoogleEvents: ["click"],

    // aliased from controller so that if they are not defined they use the values from the controller
    title: alias("controller.title"),
    opacity: alias("controller.opacity"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    icon: alias("controller.icon"),
    lat: alias("controller.lat"),
    lng: alias("controller.lng"),

    // get the info window template name from the component or own controller
    infoWindowTemplateName: computed("controller.infoWindowTemplateName", "parentView.markerInfoWindowTemplateName", function () {
      return this.get("controller.infoWindowTemplateName") || this.get("parentView.markerInfoWindowTemplateName");
    }).readOnly(),

    infoWindowAnchor: oneWay("googleObject"),

    isInfoWindowVisible: alias("controller.isInfoWindowVisible"),

    hasInfoWindow: computed("parentView.markerHasInfoWindow", "controller.hasInfoWindow", function () {
      var fromCtrl = this.get("controller.hasInfoWindow");
      if (fromCtrl === null || fromCtrl === undefined) {
        return !!this.get("parentView.markerHasInfoWindow");
      }
      return fromCtrl;
    }).readOnly(),

    /**
     * @inheritDoc
     */
    _handleCoreEvent: function _handleCoreEvent(name) {
      if (name === "click") {
        this.set("isInfoWindowVisible", true);
      }
    }
  });

});
define('ruhungry/views/google-map/polygon', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/polyline'], function (exports, Ember, helpers, GoogleMapPolylineView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;

  /**
   * @class GoogleMapPolygonView
   * @extends GoogleMapPolylineView
   */
  exports['default'] = GoogleMapPolylineView['default'].extend({
    googleFQCN: "google.maps.Polygon",

    googleProperties: computed(function () {
      return Ember['default'].merge(this._super(), {
        fillColor: { optionOnly: true },
        fillOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      });
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    fillColor: alias("controller.fillColor"),
    fillOpacity: alias("controller.fillOpacity")
  });

});
define('ruhungry/views/google-map/polyline', ['exports', 'ember', 'ember-google-map/core/helpers', 'ruhungry/views/google-map/core'], function (exports, Ember, helpers, GoogleMapCoreView) {

  'use strict';

  var computed = Ember['default'].computed;
  var alias = computed.alias;
  var on = Ember['default'].on;

  /**
   * @class GoogleMapPolylineView
   * @extends GoogleMapCoreView
   */
  exports['default'] = GoogleMapCoreView['default'].extend({
    googleFQCN: "google.maps.Polyline",

    templateName: "google-map/polyline",

    googleProperties: computed(function () {
      return {
        isClickable: { name: "clickable", optionOnly: true },
        isVisible: { name: "visible", event: "visible_changed" },
        isDraggable: { name: "draggable", event: "draggable_changed" },
        isEditable: { name: "editable", event: "editable_changed" },
        isGeodesic: { name: "geodesic", optionOnly: true },
        icons: { optionOnly: true },
        zIndex: { optionOnly: true, cast: helpers['default'].cast.integer },
        map: { readOnly: true },
        strokeColor: { optionOnly: true },
        strokeWeight: { optionOnly: true, cast: helpers['default'].cast.number },
        strokeOpacity: { optionOnly: true, cast: helpers['default'].cast.number }
      };
    }).readOnly(),

    // aliased from controller so that if they are not defined they use the values from the controller
    strokeColor: alias("controller.strokeColor"),
    strokeWeight: alias("controller.strokeWeight"),
    strokeOpacity: alias("controller.strokeOpacity"),
    zIndex: alias("controller.zIndex"),
    isVisible: alias("controller.isVisible"),
    isDraggable: alias("controller.isDraggable"),
    isClickable: alias("controller.isClickable"),
    isEditable: alias("controller.isEditable"),
    icons: alias("controller.icons"),

    initGoogleObject: on("didInsertElement", function () {
      // force the creation of the polyline
      if (helpers['default'].hasGoogleLib() && !this.get("googleObject")) {
        this.createGoogleObject({ path: this.get("controller._path.googleArray") });
      }
    })
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('ruhungry/config/environment', ['ember'], function(Ember) {
  var prefix = 'ruhungry';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("ruhungry/tests/test-helper");
} else {
  require("ruhungry/app")["default"].create({"name":"ruhungry","version":"0.0.0.0a416237"});
}

/* jshint ignore:end */
//# sourceMappingURL=ruhungry.map