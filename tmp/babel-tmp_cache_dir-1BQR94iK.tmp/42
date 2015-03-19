import Ember from "ember";

var OrderRoute = Ember.Route.extend({
	model: function model(param) {
		return this.store.find("order", param.order_id);
	}
});

export default OrderRoute;