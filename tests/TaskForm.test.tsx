import React from 'react';
import { it, describe, expect } from 'bun:test';
import { render } from './__test-utils__/render';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders and submits', async () => {
    const onCreate = async () => {};
    const { getAllByPlaceholderText, getAllByText } = render(<TaskForm onCreate={onCreate} />);
    const inputs = getAllByPlaceholderText('Add a task');
    expect(inputs.length).toBeGreaterThan(0);
    const buttons = getAllByText('Add');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
