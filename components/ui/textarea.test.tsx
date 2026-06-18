import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders without crashing', () => {
    render(<Textarea >Test Content</Textarea> />)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Textarea className="custom" >Test Content</Textarea> />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Textarea ref={ref} >Test Content</Textarea> />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Textarea data-testid="el" >Test Content</Textarea> />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Textarea aria-label="label" >Test Content</Textarea> />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Textarea onClick={onClick}>Click me</Textarea>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(<Textarea><span>Child</span></Textarea>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
