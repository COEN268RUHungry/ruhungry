import Ember from 'ember';

var RestaurantController = Ember.ObjectController.extend({
	needs: ['login'],
	isLogged: Ember.computed.alias('controllers.login.isLogged'),
	userID: Ember.computed.alias('controllers.login.userID'),
	inputComment: '',
	foodDots: [],
	actions: {
		increaseImage: function() {
			var len = this.get('foodGallery').length,
				i = this.get('currentImageIndex');
			i++;
			this.set('currentImageIndex', i % len);
		},
		decreaseImage: function() {
			var len = this.get('foodGallery').length,
				i = this.get('currentImageIndex');
			i--;
			if (i < 0) {
				i = i + len;
			}
			this.set('currentImageIndex', i % len);
		},
		showAddComment: function() {
			this.set('isAddingComment', !this.get('isAddingComment'));
		},

		addComment: function(param) {
			var isLogged = this.get('isLogged');
			if (this.get('inputComment') !== '')
			{
				var comment = this.store.createRecord('comment', {});
				comment.set('content', this.get('inputComment'));
				comment.set('restaurant', param);
				if (isLogged){
					this.store.find('user', this.get('userID')).then(function(res) {
					comment.set('user', res);
					comment.save();
					});
				}
				else {
					this.store.find('user', '0').then(function(res) {
					comment.set('user', res);
					comment.save();
					});
				}

				this.set('inputComment', '');
			}
		}
	},
	dotsChange: function() {
		var len = this.get('foodGallery').length,
			currentImageIndex = this.get('currentImageIndex'),
			dots = [];
		for (var i=0; i<len; i++) {
			var dot = {};
			if (i === currentImageIndex) {
				dot.isCurrent = true;
			}
			dots.push(dot);
		}
		this.set('foodDots', dots);
	}.observes('currentImageIndex')
});

export default RestaurantController;