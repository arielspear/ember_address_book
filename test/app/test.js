/* global describe, it */

'use strict';

describe('app', function() {
  it('has home page', function() {
  	visit('/');
  	andThen(function() {
  		expect(currentURL()).to.eql('/');
  	});
  });
  it.skip('fails to edit nonexistent people', function() {
  	visit('/edit/735692');
  	andThen(function() {
	  	expect(currentRouteName()).to.eql('edit');
  	});
  });

  it('creates a new person in model', function() {
  	fillIn(first, 'Hello');
  	fillIn(last, 'World!');
  	andThen(function() {
  		click(addButton);
  		andThen(function() {
  			expect(find('ul.contact li:last').text()).to.eql('Hello World!');
  		});
  	});

  });
});
