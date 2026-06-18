import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders without crashing', () => {
    render(<Input placeholder="test" />)
    expect(screen.getByPlaceholderText("test")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Input className="custom" placeholder="test" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Input ref={ref} placeholder="test" />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Input data-testid="el" placeholder="test" />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Input aria-label="label" placeholder="test" />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('handles value prop', () => {
    render(<Input value="hello" readOnly />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input disabled placeholder="test" />)
    expect(screen.getByPlaceholderText('test')).toBeDisabled()
  })

  it('calls onChange', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="test" />)
    fireEvent.change(screen.getByPlaceholderText('test'), { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
