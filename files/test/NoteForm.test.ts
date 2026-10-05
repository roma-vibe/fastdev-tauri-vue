import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import NoteForm from '@/components/NoteForm.vue';

function mountForm(title: string) {
  return mount(NoteForm, { props: { title, body: '' } });
}

describe('NoteForm', () => {
  it('disables the button until there is a title', () => {
    expect(mountForm('  ').get('button').attributes('disabled')).toBeDefined();
    expect(mountForm('Title').get('button').attributes('disabled')).toBeUndefined();
  });

  it('emits submit on submit and on Cmd+Enter', async () => {
    const wrapper = mountForm('Title');

    await wrapper.get('form').trigger('submit');
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter', metaKey: true });

    expect(wrapper.emitted('submit')).toHaveLength(2);
  });

  it('updates the title model', async () => {
    const wrapper = mountForm('');

    await wrapper.get('input').setValue('Groceries');

    expect(wrapper.emitted('update:title')).toEqual([['Groceries']]);
  });
});
