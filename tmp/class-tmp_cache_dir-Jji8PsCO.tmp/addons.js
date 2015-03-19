define("ember-cli-dates", ["ember-cli-dates/index","exports"], function(__index__, __exports__) {
  "use strict";
  Object.keys(__index__).forEach(function(key){
    __exports__[key] = __index__[key];
  });
});

define('ember-cli-dates/helpers/date-and-time', ['exports', 'ember', 'ember-cli-dates/helpers/time-format'], function (exports, Ember, time_format) {

  'use strict';

  exports.dateAndTime = dateAndTime;

  function dateAndTime(date, optionalLocale) {
    return time_format.timeFormat(date, 'LLL', optionalLocale);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(dateAndTime);

});
define('ember-cli-dates/helpers/day-of-the-week', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.dayOfTheWeek = dayOfTheWeek;

  function dayOfTheWeek(date, optionalLocale) {
    validArgs['default'](arguments, 'day-of-the-week');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).format('dddd');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(dayOfTheWeek);

});
define('ember-cli-dates/helpers/month-and-day', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.monthAndDay = monthAndDay;

  function monthAndDay(date, optionalLocale) {
    validArgs['default'](arguments, 'day-of-the-week');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).format('MMM Do');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(monthAndDay);

});
define('ember-cli-dates/helpers/month-and-year', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.monthAndYear = monthAndYear;

  function monthAndYear(date, optionalLocale) {
    validArgs['default'](arguments, 'day-of-the-week');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).format('MMM YYYY');
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(monthAndYear);

});
define('ember-cli-dates/helpers/time-ago-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeAgoInWords = timeAgoInWords;

  function timeAgoInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-ago-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeAgoInWords);

});
define('ember-cli-dates/helpers/time-ahead-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeAheadInWords = timeAheadInWords;

  function timeAheadInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-ahead-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeAheadInWords);

});
define('ember-cli-dates/helpers/time-delta-in-words', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeDeltaInWords = timeDeltaInWords;

  function timeDeltaInWords(date, optionalLocale) {
    validArgs['default'](arguments, 'time-delta-in-words');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale);

    return moment['default'](date).locale(locale).fromNow();
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeDeltaInWords);

});
define('ember-cli-dates/helpers/time-format', ['exports', 'ember', 'moment', 'ember-cli-dates/utils/time-locale', 'ember-cli-dates/utils/valid-args'], function (exports, Ember, moment, timeLocale, validArgs) {

  'use strict';

  exports.timeFormat = timeFormat;

  function timeFormat(date, optionalFormat, optionalLocale) {
    validArgs['default'](arguments, 'time-format');

    if (Ember['default'].isBlank(date)) { return ''; }

    var locale = timeLocale['default'](optionalLocale),
        format = 'LL';

    if (Ember['default'].typeOf(optionalFormat) === 'string') {
      format = optionalFormat;
    }

    return moment['default'](date).locale(locale).format(format);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(timeFormat);

});
define('ember-cli-dates/utils/time-locale', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  function timeLocale(optionalLocale) {
    if (Ember['default'].typeOf(optionalLocale) === 'string') {
      return optionalLocale;
    }

    return moment['default']().locale();
  }
  exports['default'] = timeLocale;

});
define('ember-cli-dates/utils/valid-args', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  function validArgs(args, helper) {
    if (Ember['default'].isEmpty(args) || args.length === 1) {
      throw new Ember['default'].Error('[ember-cli-dates:' + helper + '] Invalid number of arguments, expected at least 1');
    }
  }
  exports['default'] = validArgs;

});
define("ember-google-map", ["ember-google-map/index","exports"], function(__index__, __exports__) {
  "use strict";
  Object.keys(__index__).forEach(function(key){
    __exports__[key] = __index__[key];
  });
});

define('ember-google-map/core/google-object-event', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  /* globals google */
  var slice = [].slice;
  var fmt = Ember['default'].String.fmt;

  /**
   * @class GoogleObjectEvent
   * @param {String} name
   * @param {{target: Ember.Object, action: String, method: String|Function, [prepend]: boolean}} config
   * @constructor
   */
  var GoogleObjectEvent = function (name, config) {
    this._cfg = {
      name:    name,
      method:  config.method || (config.action ? null : name),
      action:  config.action || null,
      target:  config.target || null,
      prepend: config.prepend === undefined ? !config.action : !!config.prepend
    };
  };

  /**
   * Event handler wrapper
   *
   * @method callHandler
   * @param {Ember.Object} emberObject
   * @returns {*}
   */
  GoogleObjectEvent.prototype.callHandler = function (emberObject) {
    var method, target = this._cfg.target || emberObject, args;
    args = slice.call(arguments);
    if (this._cfg.prepend) {
      args.unshift(this._cfg.name);
    }
    if (this._cfg.action) {
      args.unshift(this._cfg.action);
      return target.send.apply(target, args);
    }
    method = this._cfg.method;
    if (typeof method === 'string') {
      method = target[method];
    }
    if (method) {
      return method.apply(target, args);
    }
    else {
      // silently warn that the method does not exists and return
      Ember['default'].warn(fmt('[google-map] The method `%@` was not found on the target, no action taken.'));
    }
  };

  /**
   * Link the given ember object and google object, and start listening for the google event
   *
   * @method link
   * @param {Ember.Object} emberObject
   * @param {google.maps.MVCObject} googleObject
   */
  GoogleObjectEvent.prototype.link = function (emberObject, googleObject) {
    var name, listener;
    Ember['default'].warn('linking a google object event but it has not been unlinked first', !this._listener);
    if (emberObject && googleObject) {
      this._listener = listener = Ember['default'].run.bind(this, 'callHandler', emberObject);
      name = this._cfg.name;
      listener._googleHandle = googleObject.addListener(name, listener);
      this._listener.unlink = function () {
        google.maps.event.removeListener(listener._googleHandle);
      };
    }
  };

  /**
   * Unlink the previously linked ember and google objects, and stop listening for the google event
   *
   * @method unlink
   */
  GoogleObjectEvent.prototype.unlink = function () {
    if (this._listener) {
      this._listener.unlink();
      this._listener = null;
    }
  };

  exports['default'] = GoogleObjectEvent;

});
define('ember-google-map/core/google-object-property', ['exports', 'ember', 'ember-google-map/core/helpers'], function (exports, Ember, helpers) {

  'use strict';

  /* globals google */
  var GoogleObjectProperty = function (key, config) {
    var props = key.split(',');
    this._cfg = {
      key:        key,
      properties: props,
      name:       config.name || props.join('_').camelize(),
      toGoogle:   config.toGoogle || null,
      fromGoogle: config.fromGoogle || null,
      read:       config.read || null,
      write:      config.write || null,
      event:      config.event || null,
      cast:       config.cast || null,
      readOnly:   config.readOnly || false,
      optionOnly: config.optionOnly || false
    };
  };

  /**
   * Gets the name of the google property
   *
   * @returns {String}
   */
  GoogleObjectProperty.prototype.getName = function(){
    return this._cfg.name;
  };

  /**
   * Convert the value from google to Ember
   *
   * @method fromGoogleValue
   * @param {*} value
   * @returns {Object}
   */
  GoogleObjectProperty.prototype.fromGoogleValue = function (value) {
    var val;
    if (this._cfg.fromGoogle) {
      val = this._cfg.fromGoogle.call(this, value);
    }
    else {
      val = helpers['default'].makeObj(this._cfg.key, value);
    }
    return val;
  };

  /**
   * Convert the value from Ember to google
   *
   * @method toGoogleValue
   * @param {Object} obj
   * @returns {*}
   */
  GoogleObjectProperty.prototype.toGoogleValue = function (obj) {
    var val;
    if (this._cfg.toGoogle) {
      val = this._cfg.toGoogle.call(this, obj);
    }
    else {
      val = this._cfg.properties.length > 1 ? obj : obj[this._cfg.key];
      if (this._cfg.cast) {
        val = this._cfg.cast(val);
      }
    }
    return val;
  };

  /**
   * Reads the value from the given google object
   *
   * @method readGoogle
   * @param {google.maps.MVCObject} googleObject
   * @returns {Object}
   */
  GoogleObjectProperty.prototype.readGoogle = function (googleObject) {
    var val;
    if (this._cfg.read) {
      val = this._cfg.read.call(this, googleObject);
    }
    else if (this._cfg.optionOnly) {
      return Object.create(null);
    }
    else {
      val = googleObject['get' + this._cfg.name.capitalize()]();
    }
    return this.fromGoogleValue(val);
  };

  /**
   * Writes the given value to the given google object
   *
   * @method writeGoogle
   * @param {google.maps.MVCObject} googleObject
   * @param {Object} obj
   */
  GoogleObjectProperty.prototype.writeGoogle = function (googleObject, obj) {
    var val, p, diff = false, actual;
    if (this._cfg.optionOnly) {
      return;
    }
    actual = this.readGoogle(googleObject);
    for (var i = 0; i < this._cfg.properties.length; i++) {
      p = this._cfg.properties[i];
      if ('' + obj[p] !== '' + actual[p]) {
        diff = true;
        break;
      }
    }
    if (!diff) {
      return;
    }
    val = this.toGoogleValue(obj);
    if (this._cfg.write) {
      this._cfg.write.call(this, googleObject, val);
    }
    else {
      googleObject['set' + this._cfg.name.capitalize()](val);
    }
  };

  /**
   * Links the given google and ember objects together
   *
   * @method link
   * @param {Ember.Object} emberObject
   * @param {google.maps.MVCObject} googleObject
   */
  GoogleObjectProperty.prototype.link = function (emberObject, googleObject) {
    var _this = this, event, props, listeners;
    Ember['default'].warn('linking a google object property but it has not been unlinked first', !this._listeners);
    if (emberObject && googleObject && !this._cfg.optionOnly) {
      props = this._cfg.properties;
      event = this._cfg.event;
      // define our listeners
      this._listeners = listeners = {
        ember:  function () {
          var obj = emberObject.getProperties(props);
          this.writeGoogle(googleObject, obj);
        },
        google: Ember['default'].run.bind(this, function () {
          var p, diff = true,
            obj = this.readGoogle(googleObject),
            actual = emberObject.getProperties(props);
          for (var i = 0; i < props.length; i++) {
            p = props[i];
            if ('' + obj[p] !== '' + actual[p]) {
              diff = true;
              break;
            }
          }
          if (!diff) {
            return;
          }
          emberObject.setProperties(obj);
        })
      };
      // listen google event
      if (event) {
        listeners._googleHandle = googleObject.addListener(event, listeners.google);
      }
      // listen change on Ember properties
      props.forEach(function (name) {
        emberObject.addObserver(name, this, listeners.ember);
      }, this);

      // setup the un-linkers
      listeners.unlink = function () {
        props.forEach(function (name) {
          emberObject.removeObserver(name, this, listeners.ember);
        }, _this);
        listeners.ember = null;
        if (event) {
          google.maps.event.removeListener(listeners._googleHandle);
        }
        listeners.google = null;
      };
    }
  };

  /**
   * Unlink the previously linked ember and google objects, and stop listening for events
   */
  GoogleObjectProperty.prototype.unlink = function () {
    if (this._listeners) {
      this._listeners.unlink();
      this._listeners = null;
    }
  };

  /**
   * Fill a google options object reading the options from the given Ember Object
   *
   * @method toOptions
   * @param {Ember.Object} source
   * @param {Object} options
   */
  GoogleObjectProperty.prototype.toOptions = function (source, options) {
    var val = this.toGoogleValue(source.getProperties(this._cfg.properties));
    if (val !== undefined) {
      options[this._cfg.name] = val;
    }
  };

  exports['default'] = GoogleObjectProperty;

});
define('ember-google-map/core/helpers', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  /* globals google */
  var _hasGoogleLib = {};
  var $get = Ember['default'].get;

  var cast = {
    number:  function (val) {
      if (typeof val === 'string') {
        val = Number(val);
      }
      if (val !== null && val !== undefined && typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return val;
      }
      return undefined;
    },
    integer: function (val) {
      if ((val = cast.number(val)) !== undefined) {
        return Math.round(val);
      }
      return val;
    }
  };

  var helpers = {
    TYPE_ROAD:      'road',
    TYPE_TERRAIN:   'terrain',
    TYPE_HYBRID:    'hybrid',
    TYPE_SATELLITE: 'satellite',

    PLACE_TYPE_ADDRESS:      'geocode',
    PLACE_TYPE_BUSINESS:     'establishment',
    PLACE_TYPE_ADMIN_REGION: '(regions)',
    PLACE_TYPE_LOCALITY:     '(cities)',

    _typeMap: {
      road:      'ROADMAP',
      terrain:   'TERRAIN',
      hybrid:    'HYBRID',
      satellite: 'SATELLITE'
    },

    _autoCompleteService: null,

    cast: cast,

    hasGoogleLib: function (lib) {
      lib = lib || '';
      if (!_hasGoogleLib.hasOwnProperty(lib)) {
        if (lib) {
          helpers.hasGoogleLib('');
        }
        if (lib) {
          _hasGoogleLib[lib] = !!(_hasGoogleLib[''] && google.maps[lib]);
        }
        else {
          _hasGoogleLib[lib] = !!(window.google && google.maps);
        }
        if (!_hasGoogleLib['']) {
          Ember['default'].warn(
            '[google-map] Something went wrong with Google Map library.' +
            ' If you think it is not your side, please report the issue at' +
            ' https://github.com/huafu/ember-google-map/issues.' +
            ' Also be sure to have used `return this.loadGoogleMap()` in one of the 3 `model` hooks' +
            ' of each route which would use the component (only if you have set `google.lazyLoad`' +
            ' to true in your `config/environment.js.`)'
          );
        }
        else if (lib && !_hasGoogleLib[lib]) {
          Ember['default'].warn(
            '[google-map] You are using a module of ember-google-map which needs the %@ google library.' +
            ' But \'%@\' is not in the `ENV.googleMap.libraries` config array of your `config/environment.js`'.fmt(lib)
          );
        }
      }
      return _hasGoogleLib[lib];
    },

    /**
     * Creates an object using arguments (propertyName1, propertyValue1, propertyName2, propertyValue2, ...)
     * @param {String} [propName1]
     * @param {String} [propValue1]
     * @param {String} [others]*
     * @returns {Object}
     */
    makeObj: function () {
      var res = {};
      for (var i = 0; i < arguments.length; i += 2) {
        res[arguments[i]] = arguments[i + 1];
      }
      return res;
    },

    /**
     * Convert our type to the google one
     * @param {String} type
     * @returns {String}
     */
    typeToGoogleType:     function (type) {
      var name;
      if (helpers.hasGoogleLib() && (name = helpers._typeMap[type])) {
        return google.maps.MapTypeId[name];
      }
    },
    /**
     * Convert google map type to our type
     * @param {String} type
     * @returns {string}
     */
    typeFromGoogleType:   function (type) {
      if (helpers.hasGoogleLib() && type) {
        for (var k in helpers._typeMap) {
          if (helpers._typeMap.hasOwnProperty(k) && google.maps.MapTypeId[helpers._typeMap[k]] === type) {
            return k;
          }
        }
      }
    },
    /**
     * Convert a lat/lng pair to a google one
     * @param {Number} lat
     * @param {Number} lng
     * @returns {google.maps.LatLng}
     */
    latLngToGoogleLatLng: function (lat, lng) {
      if (lat != null && lng != null && helpers.hasGoogleLib()) {
        return new google.maps.LatLng(Number(lat), Number(lng));
      }
    },
    /**
     * Convert a google LatLng object to lat/lng
     * @param {google.maps.LatLng} obj
     * @returns {Array<Number>}
     */
    googleLatLngToLatLng: function (obj) {
      return [obj.lat(), obj.lng()];
    },

    /**
     * Converts SW lat/lng + NE lat/lng to a google.map.LatLngBounds object
     * @param {Number} swLat
     * @param {Number} swLng
     * @param {Number} neLat
     * @param {Number} neLng
     * @returns {google.maps.LatLngBounds}
     */
    boundsToGoogle: function (swLat, swLng, neLat, neLng) {
      if (swLat != null && swLng != null && neLat != null && neLng != null && helpers.hasGoogleLib()) {
        return new google.maps.LatLngBounds(
          helpers.latLngToGoogleLatLng(swLat, swLng),
          helpers.latLngToGoogleLatLng(neLat, neLng)
        );
      }
    },

    latLngProperty: function () {
      return Ember['default'].computed(function () {
        return {lat: null, lng: null};
      });
    },

    autoCompleteService: function () {
      if (!helpers._autoCompleteService && helpers.hasGoogleLib('places')) {
        helpers._autoCompleteService = new google.maps.places.AutocompleteService();
      }
      return helpers._autoCompleteService;
    },

    autoCompleteAddress: function (options) {
      var service = helpers.autoCompleteService();
      if (service) {
        return new Ember['default'].RSVP.Promise(function (resolve, reject) {
          var Status = google.maps.places.PlacesServiceStatus, err;
          service.getPlacePredictions(options, function (results, status) {
            if (status === Status.OK || status === Status.ZERO_RESULTS) {
              resolve(results || []);
            }
            else {
              err = new Error('error retrieving completion (' + status + ')');
              err.status = status;
              reject(err);
            }
          });
        });
      }
      return Ember['default'].RSVP.reject(new Error('could not access google place library'));
    },

    _typeFromGoogle:   function (key, val) {
      if (arguments.length === 1) {
        val = key;
        key = null;
      }
      return helpers.makeObj(key || 'type', helpers.typeFromGoogleType(val));
    },
    _typeToGoogle:     function (key, obj) {
      if (arguments.length === 1) {
        obj = key;
        key = null;
      }
      return helpers.typeToGoogleType(obj[key || 'type']);
    },
    _latLngFromGoogle: function (latKey, lngKey, val) {
      if (arguments.length === 1) {
        val = latKey;
        latKey = null;
      }
      return helpers.makeObj(latKey || 'lat', val.lat(), lngKey || 'lng', val.lng());
    },
    _latLngToGoogle:   function (latKey, lngKey, obj) {
      if (arguments.length === 1) {
        obj = latKey;
        latKey = null;
      }
      return helpers.latLngToGoogleLatLng($get(obj, latKey || 'lat'), $get(obj, lngKey || 'lng'));
    },
    _boundsToGoogle:   function (swLatKey, swLngKey, neLatKey, neLngKey, obj) {
      if (arguments.length === 1) {
        obj = swLatKey;
        swLatKey = null;
        if (obj && obj.sw && obj.ne) {
          swLatKey = 'sw.lat';
          swLngKey = 'sw.lng';
          neLatKey = 'ne.lat';
          neLngKey = 'ne.lng';
        }
      }
      return helpers.boundsToGoogle(
        $get(obj, swLatKey || 'southWestLat'), $get(obj, swLngKey || 'southWestLng'),
        $get(obj, neLatKey || 'northEastLat'), $get(obj, neLngKey || 'northEastLng')
      );
    }
  };

  exports['default'] = helpers;

  exports.cast = cast;

});
define('ember-google-map/mixins/google-array', ['exports', 'ember', 'ember-google-map/core/helpers'], function (exports, Ember, helpers) {

  'use strict';

  /* globals google */
  var EMPTY = [];

  /**
   * @extension GoogleArrayMixin
   * @mixin GoogleArrayMixin
   */
  exports['default'] = Ember['default'].Mixin.create({

    googleArray: Ember['default'].computed(function (key, value) {
      var array;
      if (arguments.length > 1) {
        // set
        array = value ? value.getArray().slice() : [];
        this.set('observersEnabled', false);
        this.replace(0, this.get('length') || 0, this._startObservingEmberProperties(
          this._google2ember(array, true), true
        ));
        this.set('observersEnabled', true);
        return value;
      }
      else {
        if (!helpers['default'].hasGoogleLib()) {
          return;
        }
        return new google.maps.MVCArray(
          this._ember2google(this._startObservingEmberProperties(this.toArray().slice(), true), true)
        );
      }
    }),

    emberItemFactory:       null,
    googleItemFactory:      null,
    observeEmberProperties: null,

    _google2ember: function (item, isArray) {
      if (this.emberItemFactory) {
        if (isArray) {
          for (var i = 0; i < item.length; i++) {
            item[i] = this.emberItemFactory(item[i]);
          }
        }
        else {
          item = this.emberItemFactory(item);
        }
      }
      return item;
    },

    _ember2google: function (item, isArray) {
      if (this.googleItemFactory) {
        if (isArray) {
          for (var i = 0; i < item.length; i++) {
            item[i] = this.googleItemFactory(item[i]);
          }
        }
        else {
          item = this.googleItemFactory(item);
        }
      }
      return item;
    },

    _startObservingEmberProperties: function (object, isArray) {
      var props = this.get('observeEmberProperties'), emberArray = this;
      if (props && props.length) {
        var one = function (obj) {
          for (var i = 0; i < props.length; i++) {
            Ember['default'].addObserver(obj, props[i], emberArray, '_handleObjectPropertyChange');
          }
        };
        if (isArray) {
          for (var i = 0; i < object.length; i++) {
            one(object[i]);
          }
        }
        else {
          one(object);
        }
      }
      return object;
    },

    _stopObservingEmberProperties: function (object, isArray) {
      var props = this.get('observeEmberProperties'), emberArray = this;
      if (props && props.length) {
        var one = function (obj) {
          for (var i = 0; i < props.length; i++) {
            Ember['default'].removeObserver(obj, props[i], emberArray, '_handleObjectPropertyChange');
          }
        };
        if (isArray) {
          for (var i = 0; i < object.length; i++) {
            one(object[i]);
          }
        }
        else {
          one(object);
        }
      }
      return object;
    },

    _handleObjectPropertyChange: function (sender/*, key, value*/) {
      var index = -1, array, googleArray;
      if (this.get('observersEnabled')) {
        this.set('observersEnabled', false);
        array = this.toArray();
        googleArray = this.get('googleArray');
        while ((index = array.indexOf(sender, index + 1)) !== -1) {
          googleArray.setAt(index, this._ember2google(array[index]));
        }
        this.set('observersEnabled', true);
      }
    },

    googleListenersEnabled: null,

    observersEnabledLevel: 0,

    observersEnabled: Ember['default'].computed(function (key, value) {
      if (arguments.length > 1) {
        value = this.incrementProperty('observersEnabledLevel', value ? 1 : -1);
      }
      else {
        value = this.get('observersEnabledLevel');
      }
      return (value === 0);
    }),

    setupGoogleArray: Ember['default'].observer('googleArray', Ember['default'].on('init', function () {
      var googleArray = this.get('googleArray');
      Ember['default'].warn('setting up a google array but it has not been teardown first', !this._googleListeners);
      if (googleArray) {
        // setup observers/events
        this._googleListeners = {
          insertAt: googleArray.addListener('insert_at', this.handleGoogleInsertAt.bind(this)),
          removeAt: googleArray.addListener('remove_at', this.handleGoogleRemoveAt.bind(this)),
          setAt:    googleArray.addListener('set_at', this.handleGoogleSetAt.bind(this))
        };
      }
    })),

    teardownGoogleArray: Ember['default'].beforeObserver('googleArray', Ember['default'].on('destroy', function () {
      if (this._googleListeners) {
        if (helpers['default'].hasGoogleLib()) {
          // teardown observers/events
          for (var k in this._googleListeners) {
            if (this._googleListeners.hasOwnProperty(k)) {
              google.maps.event.removeListener(this._googleListeners[k]);
            }
          }
        }
        this._googleListeners = null;
      }
      this._stopObservingEmberProperties(this.toArray(), true);
    })),

    handleGoogleInsertAt: function (index) {
      if (this.get('observersEnabled')) {
        this.set('observersEnabled', false);
        this.replace(index, 0, [
          this._startObservingEmberProperties(this._google2ember(this.get('googleArray').getAt(index)))
        ]);
        this.set('observersEnabled', true);
      }
    },

    handleGoogleRemoveAt: function (index) {
      if (this.get('observersEnabled')) {
        this.set('observersEnabled', false);
        this._stopObservingEmberProperties(this.objectAt(index));
        this.replace(index, 1, EMPTY);
        this.set('observersEnabled', true);
      }
    },

    handleGoogleSetAt: function (index) {
      if (this.get('observersEnabled')) {
        this.set('observersEnabled', false);
        this._stopObservingEmberProperties(this.objectAt(index));
        this.replace(index, 1, [
          this._startObservingEmberProperties(this._google2ember(this.get('googleArray').getAt(index)))
        ]);
        this.set('observersEnabled', true);
      }
    },

    arrayContentDidChange: function (start, removeCount, addCount) {
      var i, googleArray, slice;
      this._super.apply(this, arguments);
      if (this.get('observersEnabled')) {
        this.set('observersEnabled', false);
        googleArray = this.get('googleArray');
        for (i = 0; i < removeCount; i++) {
          this._stopObservingEmberProperties(this.objectAt(start));
          googleArray.removeAt(start);
        }
        slice = this._ember2google(
          this._startObservingEmberProperties(this.toArray().slice(start, start + addCount), true), true
        );
        while (slice.length) {
          googleArray.insertAt(start, slice.pop());
        }
        this.set('observersEnabled', true);
      }
    }
  });

});
define('ember-google-map/mixins/google-object', ['exports', 'ember', 'ember-google-map/core/google-object-property', 'ember-google-map/core/google-object-event'], function (exports, Ember, GoogleObjectProperty, GoogleObjectEvent) {

  'use strict';

  var computed = Ember['default'].computed;
  var oneWay = computed.oneWay;
  var fmt = Ember['default'].String.fmt;
  var forEach = Ember['default'].EnumerableUtils.forEach;

  /**
   * @extension GoogleObjectMixin
   * @mixin GoogleObjectMixin
   */
  var GoogleObjectMixin = Ember['default'].Mixin.create({
    /**
     * The fully qualified class name of the object
     * @property googleFQCN
     * @type {string}
     */
    googleFQCN: null,

    /**
     * The class of this object
     * @property googleClass
     * @type {subclass of google.maps.MVCObject}
     */
    googleClass: computed('googleFQCN', function (key, value) {
      var path;
      if (arguments.length > 1) {
        return value;
      }
      else {
        path = this.get('googleFQCN');
        if (path) {
          return Ember['default'].get(window, path);
        }
      }
    }),


    /**
     * Name/label of the object for debug
     * @property googleName
     * @type {string}
     */
    googleName: computed('googleFQCN', function (key, value) {
      var name;
      if (arguments.length > 1) {
        return value;
      }
      else {
        name = this.get('googleFQCN');
        return name ? Ember['default'].String.dasherize(name.split('.').pop()) : this.toString();
      }
    }),

    /**
     * The definition of all google properties to bind
     * @property googleProperties
     * @type Object
     */
    googleProperties: Ember['default'].required(),

    /**
     * The definition of all google events to bind
     * @property googleEvents
     * @type Object
     */
    googleEvents: oneWay('controller.googleEvents'),

    /**
     * The google object itself
     * @property googleObject
     * @type google.maps.MVCObject
     */
    googleObject: null,

    /**
     * Creates the google object
     *
     * @method createGoogleObject
     * @param {*} [firstArg]
     * @param {Object} [optionsOverrides]
     * @return {google.maps.MVCObject}
     */
    createGoogleObject: function (optionsOverrides) {
      var opt = this.serializeGoogleOptions(), object, firstArg, Class;
      if (arguments.length === 2) {
        firstArg = optionsOverrides;
        optionsOverrides = arguments[1];
      }
      opt = Ember['default'].merge(opt, optionsOverrides);
      Ember['default'].debug(fmt(
        '[google-maps] creating new %@: %@', this.get('googleName'), opt
      ));
      Class = this.get('googleClass');
      if (firstArg) {
        object = new Class(firstArg, opt);
      }
      else {
        object = new Class(opt);
      }
      this.set('googleObject', object);
      this.synchronizeEmberObject();
      return object;
    },


    /**
     * An array of all compiled (parsed) properties
     * @property _compiledProperties
     * @type Array.<GoogleObjectProperty>
     * @private
     */
    _compiledProperties: computed(function () {
      var def = this.get('googleProperties') || {},
        res = [], d, defined = Object.create(null);
      for (var k in def) {
        if (def.hasOwnProperty(k)) {
          d = def[k];
          if (typeof d === 'string') {
            d = {name: d};
          }
          else if (d === true) {
            d = {};
          }
          res.push(d = new GoogleObjectProperty['default'](k, d));
          defined[d.getName()] = null;
          d = null;
        }
      }
      // now read all properties of the object which name start with 'gopt_'
      def = Ember['default'].keys(this);
      for (var i = 0; i < def.length; i++) {
        if (/^gopt_/.test(def[i]) && (k = def[i].substr(5)) && !(k in defined)) {
          res.push(new GoogleObjectProperty['default'](def[i], {name: k, optionOnly: true}));
        }
      }
      return Ember['default'].A(res);
    }).readOnly(),

    /**
     * An array of all compiled (parsed) events
     * @property _compiledEvents
     * @type Array.<GoogleObjectEvent>
     * @private
     */
    _compiledEvents: computed(function () {
      var def, k, res, d, defaultTarget;
      def = this.get('googleEvents') || {};
      res = [];
      defaultTarget = this.get('googleEventsTarget');

      // first add our core events
      forEach(this.get('_coreGoogleEvents') || [], function (name) {
        res.push(new GoogleObjectEvent['default'](name, {
          target:  this,
          method:  '_handleCoreEvent',
          prepend: true
        }));
      });

      // then add user defined events
      for (k in def) {
        if (def.hasOwnProperty(k)) {
          d = def[k];
          if (typeof d === 'string') {
            d = {action: d};
          }
          else if (d === true) {
            d = {};
          }
          if (!d.target && defaultTarget) {
            d.target = defaultTarget;
          }
          res.push(new GoogleObjectEvent['default'](k, d));
          d = null;
        }
      }
      return Ember['default'].A(res);
    }).readOnly(),

    /**
     * Handle a core event
     *
     * @method _handleCoreEvent
     * @param {string} name
     */
    _handleCoreEvent: function (name) {
      Ember['default'].debug(fmt(
        '[google-map] Unhandled core event `%@` triggered on `%@`', name, this.get('googleName')
      ));
    },


    /**
     * Serialize all google options into an object usable with google object constructor
     *
     * @method serializeGoogleOptions
     * @returns {Object}
     */
    serializeGoogleOptions: function () {
      var res = {}, def = this.get('_compiledProperties');
      for (var i = 0; i < def.length; i++) {
        def[i].toOptions(this, res);
      }
      return res;
    },

    /**
     * Synchronize this Ember object by reading all values of the properties from google object
     */
    synchronizeEmberObject: function () {
      var def = this.get('_compiledProperties'),
        go = this.get('googleObject');
      if (!go) {
        return;
      }
      this.beginPropertyChanges();
      for (var i = 0; i < def.length; i++) {
        if (!def[i]._cfg.readOnly) {
          this.setProperties(def[i].readGoogle(go));
        }
      }
      this.endPropertyChanges();
    },

    /**
     * Unlink the google object
     */
    unlinkGoogleObject: Ember['default'].beforeObserver('googleObject', function () {
      this.get('_compiledEvents').invoke('unlink');
      this.get('_compiledProperties').invoke('unlink');
    }),

    /**
     * Link the google object to this object
     */
    linkGoogleObject: Ember['default'].observer('googleObject', function () {
      var obj = this.get('googleObject');
      if (obj) {
        this.get('_compiledProperties').invoke('link', this, obj);
        this.get('_compiledEvents').invoke('link', this, obj);
      }
    }),

    /**
     * Destroy our object, removing all listeners and pointers to google's object
     */
    destroyGoogleObject: Ember['default'].on('destroy', function () {
      this.set('googleObject', null);
      this.get('_compiledEvents').clear();
      this.get('_compiledProperties').clear();
    })
  });

  exports['default'] = GoogleObjectMixin;

});
define('ember-google-map/utils/load-google-map', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var promise;

  /**
   * Loads the google map SDK
   *
   * @return {Ember.RSVP.Promise}
   */
  function loadGoogleMap(resolveWith) {
    var src, $meta = Ember['default'].$('meta[name="ember-google-map-sdk-url"]');
    if ($meta.length) {
      // get the url of the script and remove the meta
      src = $meta.attr('content');
      $meta.remove();
      // promise making sure the script is loaded
      return promise = new Ember['default'].RSVP.Promise(function (resolve, reject) {
        window.__emberGoogleMapLoaded__ = Ember['default'].run.bind(function () {
          promise = null;
          window.__emberGoogleMapLoaded__ = null;
          resolve(resolveWith);
        });
        Ember['default'].$.getScript(src + '&callback=__emberGoogleMapLoaded__').fail(function (jqXhr) {
          promise = null;
          window.__emberGoogleMapLoaded__ = null;
          reject(jqXhr);
        });
      });
    }
    else if (promise) {
      // we already have the promise loading the script, use it as the core promise to wait for but
      // resolve to what was given this time
      return promise.then(function () {
        return resolveWith;
      });
    }
    else {
      // no need to do anything, resolve directly
      return Ember['default'].RSVP.resolve(resolveWith);
    }
  }
  exports['default'] = loadGoogleMap;

});//# sourceMappingURL=addons.map