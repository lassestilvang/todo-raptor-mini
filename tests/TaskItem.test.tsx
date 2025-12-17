import React from 'react'
import { it, describe, expect } from 'bun:test'
import { render } from './__test-utils__/render'
import TaskItem from '../components/TaskItem'

describe('TaskItem', () => {
  it('renders title and notes', () => {
    const task = { title: 'Hello', notes: 'World', dueDate: null }
    const { getByText } = render(<TaskItem task={task} />)
    expect(getByText('Hello')).toBeTruthy()
    expect(getByText('World')).toBeTruthy()
  })
})
