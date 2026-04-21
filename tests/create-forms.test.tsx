import { describe, it, expect } from 'bun:test';
import { render } from './__test-utils__/render';
import CreateLabel from '../components/CreateLabel';
import CreateList from '../components/CreateList';

describe('Create form components', () => {
  it('renders CreateLabel form', () => {
    const { getByPlaceholderText, container } = render(<CreateLabel />);
    expect(getByPlaceholderText('Icon')).toBeTruthy();
    expect(getByPlaceholderText('Label')).toBeTruthy();
    const button = container.querySelector('button');
    expect(button?.textContent).toBe('Add');
  });

  it('renders CreateList form', () => {
    const { getByPlaceholderText, container } = render(<CreateList />);
    expect(getByPlaceholderText('Emoji')).toBeTruthy();
    expect(getByPlaceholderText('New list')).toBeTruthy();
    const button = container.querySelector('button');
    expect(button?.textContent).toBe('Add');
  });
});
