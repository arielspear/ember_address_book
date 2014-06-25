/* global Ember: false */

'use strict';

var AddressBook = Ember.Application.create();
require('./router.js')(AddressBook);

AddressBook.Person = Ember.Object.extend({
	firstName: null,
	lastName: null
});
var ironman = AddressBook.Person.create({
	firstName: 'Tian',
	lastName: 'Song'
});
console.log(ironman);