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