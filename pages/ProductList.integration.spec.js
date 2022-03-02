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
});
