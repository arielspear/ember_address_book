'use strict';

module.exports = function(AddressBook) {
	AddressBook.IndexController = Ember.ArrayController.extend({
		itemController: 'contact',
		sortProperties: ['lastName'],
  	sortAscending: true
	});

	AddressBook.ContactController = Ember.ObjectController.extend({
		firstName: function(key, value) {
			if (arguments.length > 1) {
				this.set('model.firstName', value);
			}
			return this.get('model.firstName') || 'Undefined';
		}.property('model.firstName'),

		lastName: function(key, value) {
			if (arguments.length > 1) {
				this.set('model.lastName', value);
			}
			return this.get('model.lastName') || 'Undefined';
		}.property('model.lastName')
	});
};
