import { mount } from '@vue/test-utils';

import DefaultLayout from '@/layouts/default.vue';
import Cart from '@/components/cart.vue';
import { CartManager } from '@/managers/CartManager';

function mountLayout() {
  const wrapper = mount(DefaultLayout, {
    mocks: {
      $cart: new CartManager(),
    },
    stubs: {
      Nuxt: true,
    },
  });

  return { wrapper };
}

describe('Default', () => {
  it('should ', () => {
    const { wrapper } = mountLayout();

    expect(wrapper.findComponent(Cart).exists()).toBe(true);
  });

  it('should toggle cart visibility', async () => {
    const { wrapper } = mountLayout();
    const button = wrapper.find('[data-testid="toggle-button"]');

    await button.trigger('click');
    expect(wrapper.vm.isCartOpen).toBe(true);

    await button.trigger('click');
    expect(wrapper.vm.isCartOpen).toBe(false);
  });
});
