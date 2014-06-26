/* global Ember: false */

'use strict';

module.exports = function(AddressBook) {

	AddressBook.Router.map(function() {
		this.route('about');
		this.route('edit', {path: '/edit/:id'});
		this.resource('contact', function() {
			this.route('new');
		});
	});

AddressBook.ApplicationRoute = Ember.Route.extend({
	model: function () {
		return this.store.find('person');
	}
});

	var displayArray = [
		{ id: 1, title: 'hello' },
		{ id: 2, title: 'this' },
		{ id: 3, title: 'is' },
		{ id: 4, title: 'an array' }
	];

	AddressBook.AboutRoute = Ember.Route.extend({
		model: function() {
			return displayArray;
		}
	});

	AddressBook.EditRoute = Ember.Route.extend({
		model: function(params) {
			var obj;
			displayArray.forEach(function(element) {
				if (element.id === parseInt(params.id)) {
					obj = element;
				}
			});
			return obj;
		}
	});

};
