import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';

import ProductCard from './ProductCard.vue';

const mountProductCard = (server) => {
  const title = 'Relógio bonito';
  const price = '22.00';
  const product = server.create('product', {
    title,
    price,
    image: '',
  });

  const wrapper = mount(ProductCard, {
    propsData: {
      product,
    },
  });

  return { wrapper, product };
};

describe('ProductCard - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const { wrapper } = mountProductCard(server);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should mount the component', () => {
    const { wrapper, product } = mountProductCard(server);

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain(product.title);
    expect(wrapper.text()).toContain(product.price);
  });

  it('should emit the event addToCart with product object when button gets clicked', async () => {
    const { wrapper, product } = mountProductCard(server);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted().addToCart).toBeTruthy();
    expect(wrapper.emitted().addToCart.length).toBe(1);
    expect(wrapper.emitted().addToCart[0]).toEqual([{ product }]);
  });
});
