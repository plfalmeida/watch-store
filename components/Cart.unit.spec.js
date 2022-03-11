import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

import Cart from '@/components/Cart';
import CartItem from '@/components/CartItem';

describe('Cart', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  function mountCart({ props = {} } = {}) {
    const products = server.createList('product', 2);
    const cartManager = new CartManager();
    const wrapper = mount(Cart, {
      propsData: { products, ...props },
      mocks: {
        $cart: cartManager,
      },
    });
    return { wrapper, products, cartManager };
  }

  it('should mount the component', () => {
    const { wrapper } = mountCart();
    expect(wrapper.vm).toBeDefined();
  });

  it('should not display empty cart button when there are no products', () => {
    const { cartManager } = mountCart();
    const wrapper = mount(Cart, {
      mocks: {
        $cart: cartManager,
      },
    });

    expect(wrapper.find('[data-testid="clear-cart-button"]').exists()).toBe(
      false
    );
  });

  it('should emit close event when button gets clicked', () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('button[data-testid="close-button"]');

    button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('should hide the cart when no prop isOpen is passed', () => {
    const { wrapper } = mountCart();
    expect(wrapper.classes()).toContain('hidden');
  });

  it('should display the cart when prop isOpen is passed', () => {
    const { wrapper } = mountCart({ props: { isOpen: true } });
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('should display "Cart is empty" when there are no products', () => {
    const { wrapper } = mountCart({ props: { isOpen: true, products: [] } });
    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('should display 2 instances of CartItem when 2 products are provided', () => {
    const { wrapper } = mountCart();

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  it('should display a button to clear cart', () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="clear-cart-button"]');

    expect(button.exists()).toBe(true);
  });

  it('should call cartManager.clearProducts() when button gets clicked', async () => {
    const { wrapper, cartManager } = mountCart();
    const spy = jest.spyOn(cartManager, 'clearProducts');
    const button = wrapper.find('[data-testid="clear-cart-button"]');

    await button.trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
