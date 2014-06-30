'use strict';

describe('app', function() {
  beforeEach(function() {
    AddressBook.reset();
    AddressBook.ApplicationAdapter = DS.FixtureAdapter.extend();
    AddressBook.Person.FIXTURES = [
      { id:1, firstName: 'Ariel', lastName: 'Spear' },
      { id:2, firstName: 'Grant', lastName: 'Stampfli' },
      { id:3, firstName: 'Tian', lastName: 'Song' }
    ];
  });
  describe('home page', function() {
    beforeEach(function() {
      visit('/');
    });
    it('has home page', function() {
      expect(currentRouteName()).to.eql('index');
      expect(currentURL()).to.eql('/');
  		expect(currentPath()).to.eql('index');
    });
    it('creates a new person in model', function() {
    	fillIn('#first', 'Hello');
    	fillIn('#last', 'World!');
  		click('#addButton');
  		andThen(function() {
  			expect(find('ul.contact li:last').text()).to.eql('Hello World!');
  		});
    });
    it('links to the contact template', function() {
      click('ul.contact li:first-of-type a');
      andThen(function() {
        expect(currentRouteName()).to.eql('contact');
        expect(currentURL()).to.eql('/contact/1');
        click('#editButton');
        andThen(function() {
          expect(currentRouteName()).to.eql('index');
        });
      });
    });
    it('deletes a contact when the delete button is clicked', function() {
      click('ul.contact li:first-of-type a');
      andThen(function() {
        expect(currentRouteName()).to.eql('contact');
        expect(currentURL()).to.eql('/contact/1');
        click('#deleteButton');
        andThen(function() {
          expect(currentRouteName()).to.eql('index');
          expect(find('ul.contact li').length).to.eql(2);
        });
      });
    });
    it('creates a new person in model', function() {
      click('#addButton');
      andThen(function() {
        expect(find('ul.contact li:last').text()).to.eql('Undefined ');
      });
    });
    it('sorts names alphabetically by last name.', function(){
        expect(find('ul.contact li:first').text()).to.eql('Tian Song');
    });
  });

  it.skip('fails to edit nonexistent people', function() {
    visit('/edit/735692');
    andThen(function() {
      expect(currentRouteName()).to.eql('edit');
    });
  });
});
