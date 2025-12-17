import '../setup'
import React from 'react'
import { render as rtlRender } from '@testing-library/react'

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { ...options })
}
