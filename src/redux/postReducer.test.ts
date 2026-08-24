import { describe, it, expect } from 'vitest';
import { postReducer } from './postReducer';
import { importedPostsAction } from './actions';

describe('postReducer', () => {
  it('should store imported posts from backend', () => {
    const payload = [
      { id: 1, content: 'hello', savedStyle: 'default' },
      { id: 2, content: 'world', savedStyle: 'cyber' },
    ];

    expect(postReducer([], importedPostsAction(payload))).toEqual(payload);
  });
});
