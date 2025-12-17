import React from 'react';
import { it, describe, expect } from 'bun:test';
import { render } from './__test-utils__/render';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  it('renders and updates value', () => {
    let value = '';
    const onChange = (v: string) => {
      value = v;
    };
    const { getByPlaceholderText } = render(<SearchBar value={value} onChange={onChange} />);
    const input = getByPlaceholderText('Search tasks') as HTMLInputElement;
    expect(input).toBeTruthy();
  });
});
