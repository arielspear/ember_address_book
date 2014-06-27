'use strict';

module.exports = function(AddressBook) {

	AddressBook.Router.map(function() {
		this.route('about');
		this.route('edit', {path: '/edit/:id'});
		this.route('contact', {path: '/contact/:id'});
	});

AddressBook.ApplicationRoute = Ember.Route.extend({
	model: function () {
		return this.store.find('person');
	},
	actions: {
		createPerson: function () {
			var first = this.controllerFor('application').get('inputFirstName');
			var last = this.controllerFor('application').get('inputLastName');
			console.log(first, last);
			var person = this.store.createRecord('person', {
				firstName: first,
				lastName: last
			});

			this.controllerFor('application').set('inputFirstName', '');
			this.controllerFor('application').set('inputLastName', '');
			person.save();
		}
	}
});
AddressBook.ContactRoute = Ember.Route.extend({
	model: function (param) {
		return this.store.find('person', param.id);
	},
	actions: {
		backHome: function () {
			this.transitionTo('index');
		}
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
			// if (!obj) { throw new Error('Missing'); }
			return obj;
		}
	});

};
