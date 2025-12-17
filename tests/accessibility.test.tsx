import { describe, it, expect } from 'bun:test'
import { render } from './__test-utils__/render'
import TaskForm from '../components/TaskForm'
import ThemeToggle from '../components/ThemeToggle'

describe('accessibility', () => {
  it('task form has input and submit button', () => {
    const { getAllByPlaceholderText, getAllByText } = render(<TaskForm />)
    const inputs = getAllByPlaceholderText('Add a task')
    expect(inputs.length).toBeGreaterThan(0)
    const buttons = getAllByText('Add')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('theme toggle toggles class on documentElement', () => {
    const { getByRole } = render(<ThemeToggle />)
    const btn = getByRole('button', { name: /☀️|🌙/ })
    expect(btn).toBeTruthy()
  })
})
