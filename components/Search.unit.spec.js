import { mount } from '@vue/test-utils';
import Search from '@/components/Search';
import faker from 'faker';

const mountSearch = () => {
  const wrapper = mount(Search);
  return { wrapper };
};

describe('Search - unit', () => {
  it('should mount the component', () => {
    const { wrapper } = mountSearch();

    expect(wrapper.vm).toBeDefined();
  });

  it('should emit search event when form is submitted', async () => {
    const { wrapper } = mountSearch();
    const term = faker.random.words();

    await wrapper.find('input[type="search"]').setValue(term);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term }]);
  });

  it('should emit search event when form is cleared', async () => {
    const { wrapper } = mountSearch();
    const term = faker.random.words();
    const input = wrapper.find('input[type="search"]');

    await input.setValue(term);
    await input.setValue('');

    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: '' }]);
  });
});
