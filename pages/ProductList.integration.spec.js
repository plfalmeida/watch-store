import Vue from 'vue';
import axios from 'axios';
import { mount } from '@vue/test-utils';

import { makeServer } from '@/miragejs/server';

import Search from '@/components/Search';
import ProductCard from '@/components/ProductCard';
import ProductList from '.';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('ProductList - integration', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  const getProducts = (quantity = 10, overrides = []) => {
    const overrideList = overrides.map((override) => {
      return server.create('product', override);
    });

    const products = [
      ...server.createList('product', quantity),
      ...overrideList,
    ];

    return products;
  };

  const mountProductList = async (params = {}) => {
    const { quantity = 10, overrides = [], shouldReject = false } = params;
    const products = getProducts(quantity, overrides);

    if (shouldReject) {
      axios.get.mockReturnValue(Promise.reject(new Error('error')));
    } else {
      axios.get.mockReturnValue(Promise.resolve({ data: { products } }));
    }

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });

    await Vue.nextTick();
    return { wrapper, products };
  };

  it('should mount the component', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the Search component', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should call axios.get on component mount', async () => {
    await mountProductList();

    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount the ProductCard component 10 times', async () => {
    const { wrapper } = await mountProductList();

    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(10);
  });

  it('should display the error message when Promise rejects', async () => {
    const { wrapper } = await mountProductList({ shouldReject: true });

    expect(wrapper.text()).toContain('Problemas ao carregar a lista!');
  });

  it('should filter the product list when a search is performed', async () => {
    const { wrapper } = await mountProductList({
      quantity: 10,
      overrides: [{ title: 'My loved watch' }, { title: 'My other watch' }],
    });

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('watch');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(wrapper.vm.searchTerm).toEqual('watch');
    expect(cards).toHaveLength(2);
  });

  it('should filter the product list when search is cleared', async () => {
    const { wrapper } = await mountProductList({ quantity: 11 });

    const search = wrapper.findComponent(Search);
    const searchInput = search.find('input[type="search"]');
    const form = search.find('form');

    searchInput.setValue('watch');
    await form.trigger('submit');

    searchInput.setValue('');
    await form.trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(wrapper.vm.searchTerm).toEqual('');
    expect(cards).toHaveLength(11);
  });
});
