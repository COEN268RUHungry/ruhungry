import DS from 'ember-data';

var Comment = DS.Model.extend({
	content: DS.attr('string'),
	user: DS.belongsTo('user'),
	restaurant: DS.belongsTo('restaurant', {async: true})
});

Comment.reopenClass({
	FIXTURES: [
		{
			id: '1',
			content: 'Awesome hotpot and milktea!',
			user: '1',
			restaurant: 'boilingpoint'
		},
		{
			id: '2',
			content: 'Best little hotpot in Bayarea!',
			user: '2',
			restaurant: 'boilingpoint'
		},
		{
			id: '3',
			content: 'Their milktea is pretty good! My favorite is milk tea with honey boba.',
			user: '1',
			restaurant: 'tpumps'
		},
		{
			id: '4',
			content: 'I like their peach green milk tea with honey boba.',
			user: '2',
			restaurant: 'tpumps'
		},
		{
			id: '5',
			content: 'It is a new restaurant. The line out the door is very long!',
			user: '1',
			restaurant: 'zensen'
		},
		{
			id: '6',
			content: 'Sushi are rotating on the belt!',
			user: '2',
			restaurant: 'zensen'
		},
		{
			id: '7',
			content: 'It is a Hunan restaurant. Their food is very spicy!',
			user: '1',
			restaurant: 'shaomountain'
		},
		{
			id: '8',
			content: 'One of the best Chinese restaurant in bay area!',
			user: '2',
			restaurant: 'shaomountain'
		}
	]
});

export default Comment;