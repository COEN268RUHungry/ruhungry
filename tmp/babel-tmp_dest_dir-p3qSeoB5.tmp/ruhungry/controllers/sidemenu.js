import Ember from "ember";

var SidemenuController = Ember.ObjectController.extend({
	needs: "login",
	login: Ember.computed.alias("controllers.login")

});
export default SidemenuController;