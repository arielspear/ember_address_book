/* global Ember: false, DS: false */

'use strict';

var AddressBook = Ember.Application.create();
require('./router.js')(AddressBook);

AddressBook.ApplicationAdapter = DS.FixtureAdapter;

var attr = DS.attr;

AddressBook.Person = DS.Model.extend({
	firstName: attr('string'),
	lastName: attr('string')
});

AddressBook.Person.FIXTURES = [
	{ id:1, firstName: 'Ariel', lastName: 'Spear' },
	{ id:2, firstName: 'Grant', lastName: 'Stampfli' },
	{ id:3, firstName: 'Tian', lastName: 'Song' }
];

AddressBook.ApplicationRoute = Ember.Route.extend({
	model: function () {
		return this.store.find('person', 1);
	}
});





// store.CreateRecord('post', {
// 	firstName: 'Tian',
// 	lastName: 'Song'
// });

// post.save();
// store.find('person', 1);