import { describe, it, expect } from 'bun:test';
import { render } from './__test-utils__/render';
import CreateLabel from '../components/CreateLabel';
import CreateList from '../components/CreateList';

describe('Create form components', () => {
  it('renders CreateLabel form', () => {
    const { getByPlaceholderText, getByRole } = render(<CreateLabel />);
    expect(getByPlaceholderText('Icon')).toBeTruthy();
    expect(getByPlaceholderText('Label')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Add');
  });

  it('renders CreateList form', () => {
    const { getByPlaceholderText, getByRole } = render(<CreateList />);
    expect(getByPlaceholderText('Emoji')).toBeTruthy();
    expect(getByPlaceholderText('New list')).toBeTruthy();
    expect(getByRole('button')).toHaveTextContent('Add');
  });
});
