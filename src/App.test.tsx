import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('app boots', () => {
  it('root route renders', async () => {
    render(<App />)
    expect(await screen.findByText('Tashikame')).toBeInTheDocument()
  })
})
