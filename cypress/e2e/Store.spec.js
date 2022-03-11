/// <reference types="cypress" />
import { makeServer } from '../../miragejs/server';

context('Store', () => {
  let server;
  const g = cy.get;
  const gId = cy.getByTestId;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should display the store', () => {
    cy.visit('/');
    g('body').contains('Brand');
    g('body').contains('Wrist Watch');
  });

  context('Store > Product List', () => {
    it('should display "0 Products" when no product is returned', () => {
      cy.visit('/');
      gId('product-card').should('have.length', 0);
      g('body').contains('0 Products');
    });
    it('should display "1 Product" when 1 product is returned', () => {
      server.create('product');
      cy.visit('/');

      gId('product-card').should('have.length', 1);
      g('body').contains('1 Product');
    });
    it('should display "10 Products" when 10 products are returned', () => {
      server.createList('product', 10);
      cy.visit('/');

      gId('product-card').should('have.length', 10);
      g('body').contains('10 Products');
    });
  });

  context('Store > search for products', () => {
    it('should type in the search field', () => {
      cy.visit('/');
      g('input[type="search"]').type('wrist').should('have.value', 'wrist');
    });

    it('should return 1 product when Pretty wrist is used as search term', () => {
      server.create('product', { title: 'Pretty wrist' });
      server.createList('product', 10);

      cy.visit('/');
      g('input[type="search"]').type('Pretty wrist');
      gId('search-form').submit();
      gId('product-card').should('have.length', 1);
    });

    it('should not return any product', () => {
      server.createList('product', 10);

      cy.visit('/');
      g('input[type="search"]').type('Pretty wrist');
      gId('search-form').submit();
      gId('product-card').should('have.length', 0);
      g('body').contains('0 Products');
    });
  });

  context('Store > Shopping Cart', () => {
    const quantity = 10;
    beforeEach(() => {
      server.createList('product', quantity);
      cy.visit('/');
    });

    it('should not display shopping cart when page first loads', () => {
      gId('shopping-cart').should('have.class', 'hidden');
    });

    it('should toggle shopping cart visibility when button is clicked', () => {
      gId('toggle-button').as('toggleButton');

      g('@toggleButton').click();
      gId('shopping-cart').should('not.have.class', 'hidden');

      g('@toggleButton').click({ force: true });
      gId('shopping-cart').should('have.class', 'hidden');
    });

    it('should open shopping cart when product is added', () => {
      gId('product-card').first().find('button').click();
      gId('shopping-cart').should('not.have.class', 'hidden');
    });

    it('should add first product to the cart', () => {
      gId('product-card').first().find('button').click();
      gId('cart-item').should('have.length', 1);
    });

    it('should add 3 products to the cart', () => {
      cy.addToCart({ indexes: [1, 3, 5] });

      gId('cart-item').should('have.length', 3);
    });

    it('should add 1 product to the cart', () => {
      cy.addToCart({ index: 6 });

      gId('cart-item').should('have.length', 1);
    });

    it('should add all products to the cart', () => {
      cy.addToCart({ indexes: 'all' });

      gId('cart-item').should('have.length', quantity);
    });

    it('should remove a product from the cart', () => {
      cy.addToCart({ index: 2 });
      gId('cart-item').as('cartItems');
      g('@cartItems').should('have.length', 1);
      g('@cartItems').first().find('[data-testid="remove-button"]').click();
      g('@cartItems').should('have.length', 0);
    });

    it('should display "Cart is empty" message when there are no products', () => {
      gId('toggle-button').click();
      gId('shopping-cart').contains('Cart is empty');
    });

    it('should clear cart when "Clear cart" button is clicked', () => {
      cy.addToCart({ indexes: [1, 2, 3] });
      gId('cart-item').should('have.length', 3);
      gId('clear-cart-button').click();
      gId('cart-item').should('have.length', 0);
    });

    it.only('should not display "Clear cart" button when cart is empty', () => {
      gId('toggle-button').click();
      gId('clear-cart-button').should('not.exist');
    });
  });
});
