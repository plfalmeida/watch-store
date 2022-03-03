import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';

import Cart from '@/components/Cart';
import CartItem from '@/components/CartItem';

function mountCart({ props = {} } = {}) {
  const wrapper = mount(Cart, {
    propsData: props,
  });
  return { wrapper };
}

describe('Cart', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountCart();
    expect(wrapper.vm).toBeDefined();
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
    const { wrapper } = mountCart({ props: { isOpen: true } });
    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('should display 2 instances of CartItem when 2 products are provided', () => {
    const products = server.createList('product', 2);
    const { wrapper } = mountCart({ props: { products } });

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });
});
