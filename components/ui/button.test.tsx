import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button >Test Content</Button> />)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom" >Test Content</Button> />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Button ref={ref} >Test Content</Button> />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Button data-testid="el" >Test Content</Button> />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Button aria-label="label" >Test Content</Button> />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('renders variant="default"', () => {
    const { container } = render(<Button variant="default" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders variant="destructive"', () => {
    const { container } = render(<Button variant="destructive" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders variant="outline"', () => {
    const { container } = render(<Button variant="outline" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders variant="secondary"', () => {
    const { container } = render(<Button variant="secondary" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders variant="ghost"', () => {
    const { container } = render(<Button variant="ghost" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders variant="link"', () => {
    const { container } = render(<Button variant="link" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders size="default"', () => {
    const { container } = render(<Button size="default" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders size="sm"', () => {
    const { container } = render(<Button size="sm" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders size="lg"', () => {
    const { container } = render(<Button size="lg" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders size="icon"', () => {
    const { container } = render(<Button size="icon" >Test Content</Button> />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(<Button><span>Child</span></Button>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
