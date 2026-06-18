import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders without crashing', () => {
    render(<Checkbox >Test Content</Checkbox> />)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Checkbox className="custom" >Test Content</Checkbox> />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Checkbox ref={ref} >Test Content</Checkbox> />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Checkbox data-testid="el" >Test Content</Checkbox> />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Checkbox aria-label="label" >Test Content</Checkbox> />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Checkbox onClick={onClick}>Click me</Checkbox>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(<Checkbox><span>Child</span></Checkbox>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
