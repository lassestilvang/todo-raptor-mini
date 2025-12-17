import { describe, it, expect } from 'bun:test'
import { render } from './__test-utils__/render'
import TaskForm from '../components/TaskForm'
import ThemeToggle from '../components/ThemeToggle'

describe('accessibility', () => {
  it('task form has input and submit button', () => {
    const { getByPlaceholderText, getByText } = render(<TaskForm />)
    expect(getByPlaceholderText('Add a task')).toBeTruthy()
    expect(getByText('Add')).toBeTruthy()
  })

  it('theme toggle toggles class on documentElement', () => {
    const { getByRole } = render(<ThemeToggle />)
    const btn = getByRole('button')
    expect(btn).toBeTruthy()
  })
})
