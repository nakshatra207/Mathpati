import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Index from './Index'

describe('Index page', () => {
  it('renders without crashing', () => {
    render(<Index />)
    // smoke: ensure hero heading is present
    expect(screen.getByRole('heading', { name: /Kaun Banega Mathpati/i })).toBeDefined()
  })
})

