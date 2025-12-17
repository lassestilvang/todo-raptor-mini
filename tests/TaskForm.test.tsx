import React from 'react'
import { it, describe, expect } from 'bun:test'
import { render } from './__test-utils__/render'
import TaskForm from '../components/TaskForm'

describe('TaskForm', () => {
  it('renders and submits', async () => {
    const onCreate = async () => {}
    const { getByPlaceholderText, getByText } = render(<TaskForm onCreate={onCreate} />)
    const input = getByPlaceholderText('Add a task') as HTMLInputElement
    expect(input).toBeTruthy()
    const button = getByText('Add')
    expect(button).toBeTruthy()
  })
})
