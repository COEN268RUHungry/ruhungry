import DS from 'ember-data';

var User = DS.Model.extend({
	name: DS.attr('string'),
	email: DS.attr('string'),
	address: DS.attr('string'),
	zipCode: DS.attr('string'),
	comments: DS.hasMany('comment', {async: true}),
	password:DS.attr('string')


});

User.reopenClass({
	FIXTURES: [
		{
			id: '0',
			name: 'Guest',
			
		},
		{
			id: '1',
			name: 'Su',
			email: 'su@scu.edu',
			address: '500 El Camino Real, Santa Clara, CA',
			zipCode: '95053',
			password:'sususu',
			status:false
			
		},
		{
			id: '2',
			name: 'Fay',
			email: 'fay@scu.edu',
			address: '500 ElCamino Real, Santa Clara, CA',
			zipCode: '95053',
			password:'huihui',
			status:false
		}
	]
	
});

export default User;