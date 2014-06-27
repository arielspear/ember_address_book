'use strict';

module.exports = function(AddressBook) {
	AddressBook.IndexController = Ember.ArrayController.extend({
		itemController: 'contact',
		sortProperties: ['lastName', 'firstName'],
  	sortAscending: true
	});

	AddressBook.ContactController = Ember.ObjectController.extend({
		firstName: function() {
			return this.get('model.firstName') || 'Undefined';
		}.property('model.firstName')
	});
};
