/* global describe, it, visit, andThen, expect, click, find */

'use strict';

describe('app', function() {
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
    	fillIn(first, 'Hello');
    	fillIn(last, 'World!');
  		click(addButton);
  		andThen(function() {
  			expect(find('ul.contact li:last').text()).to.eql('Hello World!');
  		});
    });
    it('links to the edit template', function() {
      click('ul.contact li:first-of-type a');
      andThen(function() {
        expect(currentRouteName()).to.eql('edit');
        expect(currentURL()).to.eql('/edit/1');
      });
    });
  });

  it.skip('fails to edit nonexistent people', function() {
    visit('/edit/735692');
    andThen(function() {
      expect(currentRouteName()).to.eql('edit');
    });
  });
});
