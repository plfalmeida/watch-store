import { mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';
import ProductCard from '@/components/ProductCard';

const mountProductCard = (server) => {
  const title = 'Relógio bonito';
  const price = '22.00';
  const product = server.create('product', {
    title,
    price,
    image: '',
  });

  const cartManager = new CartManager();

  const wrapper = mount(ProductCard, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  });

  return { wrapper, product, cartManager };
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

  it('should add item to cartState on button click', async () => {
    const { wrapper, cartManager, product } = mountProductCard(server);
    const spyOpen = jest.spyOn(cartManager, 'open');
    const spyAdd = jest.spyOn(cartManager, 'addProduct');
    await wrapper.find('button').trigger('click');

    expect(spyOpen).toHaveBeenCalledTimes(1);
    expect(spyAdd).toHaveBeenCalledTimes(1);
    expect(spyAdd).toHaveBeenCalledWith(product);
  });
});
