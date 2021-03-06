'use strict';

module.exports = function(AddressBook) {

	AddressBook.Router.map(function() {
		this.route('about');
		this.route('edit', {path: '/edit/:id'});
		this.route('contact', {path: '/contact/:id'});
	});

	AddressBook.IndexRoute = Ember.Route.extend({
		model: function () {
			return this.store.find('person');
		},
		actions: {
			createPerson: function () {
				var first = this.controllerFor('index').get('inputFirstName');
				var last = this.controllerFor('index').get('inputLastName');
				var person = this.store.createRecord('person', {
					firstName: first,
					lastName: last
				});

				this.controllerFor('index').set('inputFirstName', '');
				this.controllerFor('index').set('inputLastName', '');
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
				// var editedFirst = this.controllerFor('contact').get('firstNamePLS');
				// var modelFirst = this.controllerFor('contact').get('model.firstName');
				// console.log(editedFirst);
				// console.log(modelFirst);
				// this.set(modelFirst, editedFirst);
				this.currentModel.save();
				this.transitionTo('index');
			},
			deletePerson: function (id) {
				var self = this;
				this.store.find('person', id).then(function(person) {
					return person.destroyRecord();
				}).then(function() {
					self.transitionTo('index');
				});
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
			return obj;
		}
	});

};
