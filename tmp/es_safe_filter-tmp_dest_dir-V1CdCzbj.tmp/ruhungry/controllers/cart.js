import Ember from 'ember';

var CartController = Ember.ObjectController.extend({
	foodQuantity: 0,
	actions: {
		decrease: function(item) {
			item.set('quantity', item.get('quantity') - 1);
			this.set('foodQuantity', this.get('foodQuantity') - 1);
			if (item.get('quantity') === 0) {
				item.deleteRecord();
				item.save();
			}
		},
		increase: function(item) {
			item.set('quantity', item.get('quantity') + 1);
			this.set('foodQuantity', this.get('foodQuantity') + 1);
		},
		checkout: function() {
				this.transitionToRoute('payment');
		}
	}
});

export default CartController;