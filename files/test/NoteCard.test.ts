import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Note } from '@/api/notes.ts';
import NoteCard from '@/components/NoteCard.vue';

const note: Note = {
  id: 7,
  title: 'Groceries',
  body: 'Milk\nBread',
  createdAt: '2026-01-02T10:00:00.000Z',
};

describe('NoteCard', () => {
  it('renders the note', () => {
    const wrapper = mount(NoteCard, { props: { note } });

    expect(wrapper.get('h3').text()).toBe('Groceries');
    expect(wrapper.text()).toContain('Milk');
    expect(wrapper.get('time').attributes('datetime')).toBe(note.createdAt);
  });

  it('emits remove with the note id', async () => {
    const wrapper = mount(NoteCard, { props: { note } });

    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('remove')).toEqual([[7]]);
  });
});
