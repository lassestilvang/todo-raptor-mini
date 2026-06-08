import '../setup';
import React from 'react';
import { render as rtlRender } from '@testing-library/react';

export function render(ui: React.ReactElement, options = {}) {
  // Create an isolated container for each render so tests are scoped and don't collide
  const container = document.createElement('div');
  document.body.appendChild(container);
  return rtlRender(ui, { container, ...options });
}
