import { mount } from '@vue/test-utils';
import Cart from '@/components/Cart';

function mountCart({ props = {} } = {}) {
  const wrapper = mount(Cart, {
    propsData: props,
  });
  return { wrapper };
}

describe('Cart', () => {
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
});
