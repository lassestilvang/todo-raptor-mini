import React from 'react'
import { describe, it, expect } from 'bun:test'
import { render } from './__test-utils__/render'
import Sidebar from '../components/Sidebar'

describe('Sidebar UI', () => {
  it('renders views and lists', () => {
    const { getByText } = render(<Sidebar />)
    expect(getByText('Views')).toBeTruthy()
    expect(getByText('Lists')).toBeTruthy()
  })
})
