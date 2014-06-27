'use strict';

var AddressBook = window.AddressBook = Ember.Application.create();
require('./router.js')(AddressBook);
require('./controller/contact_controller.js')(AddressBook);
var attr = DS.attr;

AddressBook.Person = DS.Model.extend({
	firstName: attr('string', {
      defaultValue: 'Unnamed'
  }),
	lastName: attr('string')
});

AddressBook.ApplicationAdapter = DS.LSAdapter.extend({
	namespace: 'AddressBook-emberjs'
});


AddressBook.Person.FIXTURES = [
	{ id:1, firstName: 'Ariel', lastName: 'Spear' },
	{ id:2, firstName: 'Grant', lastName: 'Stampfli' },
	{ id:3, firstName: 'Tian', lastName: 'Song' }
];
