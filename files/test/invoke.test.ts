import { invoke, isTauri } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, call, toApiError } from '@/api/invoke.ts';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn(), isTauri: vi.fn() }));

describe('call', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(isTauri).mockReturnValue(true);
  });

  it('invokes the Rust command with its arguments', async () => {
    vi.mocked(invoke).mockResolvedValue({ id: 1 });

    await expect(call('create_note', { input: { title: 'A' } })).resolves.toEqual({ id: 1 });
    expect(invoke).toHaveBeenCalledWith('create_note', { input: { title: 'A' } });
  });

  it('turns Rust errors into ApiError', async () => {
    vi.mocked(invoke).mockRejectedValue({
      code: 'validation',
      message: 'Title must not be blank.',
    });

    const error = await call('create_note').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'validation', message: 'Title must not be blank.' });
  });

  it('fails clearly outside the desktop app', async () => {
    vi.mocked(isTauri).mockReturnValue(false);

    await expect(call('list_notes')).rejects.toMatchObject({ code: 'unavailable' });
    expect(invoke).not.toHaveBeenCalled();
  });
});

describe('toApiError', () => {
  it('treats unknown rejections as internal errors', () => {
    expect(toApiError('boom')).toMatchObject({ code: 'internal', message: 'boom' });
    expect(toApiError({ code: 'weird', message: 'x' })).toMatchObject({ code: 'internal' });
  });
});
