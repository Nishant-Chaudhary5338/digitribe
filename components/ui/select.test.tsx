import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from './Select'

describe('Select', () => {
  it('renders without crashing', () => {
    render(<Select >Test Content</Select> />)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Select className="custom" >Test Content</Select> />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Select ref={ref} >Test Content</Select> />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Select data-testid="el" >Test Content</Select> />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Select aria-label="label" >Test Content</Select> />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Select onClick={onClick}>Click me</Select>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(<Select><span>Child</span></Select>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
