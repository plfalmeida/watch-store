import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';

import CartItem from '@/components/CartItem';

let server;

const mountCartItem = () => {
  const product = server.create('product', {
    title: 'Pretty watch',
    price: '22.33',
  });

  const wrapper = mount(CartItem, { propsData: { product } });

  return { wrapper, product };
};

describe('CartItem', () => {
  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountCartItem();
    expect(wrapper.vm).toBeDefined();
  });

  it('should display product info', () => {
    const { wrapper, product } = mountCartItem();
    const content = wrapper.text();

    expect(content).toContain(product.title);
    expect(content).toContain(product.price);
  });

  it('should display quantity 1 when product is added', () => {
    const { wrapper } = mountCartItem();
    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toContain('1');
  });

  it('should increase quantity when + button gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="+"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('2');

    await button.trigger('click');
    expect(quantity.text()).toContain('3');

    await button.trigger('click');
    expect(quantity.text()).toContain('4');
  });

  it('should decrease quantity when - button gets clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="-"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });

  it('should not got below zero when button - is repeatedly clicked', async () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="-"]');
    const quantity = wrapper.find('[data-testid="quantity"]');

    await button.trigger('click');
    await button.trigger('click');
    expect(quantity.text()).toContain('0');
  });
});
