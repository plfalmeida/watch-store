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

const mountProductList = () => {
  const wrapper = mount(ProductList);
  return { wrapper };
};

const mountProductListWithMocks = () => {
  const wrapper = mount(ProductList, {
    mocks: {
      $axios: axios,
    },
  });
  return { wrapper };
};

describe('ProductList - integration', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountProductList();

    expect(wrapper.vm).toBeDefined();
  });

  it('should mount the Search component', () => {
    const { wrapper } = mountProductList();

    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should call axios.get on component mount', () => {
    mountProductListWithMocks();

    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount the ProductCard component 10 times', async () => {
    const products = server.createList('product', 10);
    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const { wrapper } = mountProductListWithMocks();
    await Vue.nextTick();

    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(10);
  });

  it('should display the error message when Promise rejects', async () => {
    axios.get.mockReturnValue(Promise.reject(new Error('error')));
    const { wrapper } = mountProductListWithMocks();

    await Vue.nextTick();

    expect(wrapper.text()).toContain('Problemas ao carregar a lista!');
  });

  it('should filter the product list when a search is performed', async () => {
    const products = [
      ...server.createList('product', 10),
      server.create('product', {
        title: 'My loved watch',
      }),
      server.create('product', {
        title: 'My other watch',
      }),
    ];

    axios.get.mockReturnValue(Promise.resolve({ data: { products } }));

    const { wrapper } = mountProductListWithMocks();

    await Vue.nextTick();

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('watch');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(wrapper.vm.searchTerm).toEqual('watch');
    expect(cards).toHaveLength(2);
  });
});
