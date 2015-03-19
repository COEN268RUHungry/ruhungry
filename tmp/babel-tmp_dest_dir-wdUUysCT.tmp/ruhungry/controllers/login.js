import Ember from "ember";

var LoginController = Ember.ObjectController.extend({
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
export default LoginController;