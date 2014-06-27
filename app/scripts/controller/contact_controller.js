'use strict';

module.exports = function(AddressBook) {
	AddressBook.IndexController = Ember.ArrayController.extend({
		itemController: 'contact'
	});

	AddressBook.ContactController = Ember.ObjectController.extend({
		firstName: function() {
			return this.get('model.firstName') || 'Undefined';
		}.property('model.firstName')
	});
};
