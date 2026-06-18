import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders without crashing', () => {
    render(<Tag >Test Content</Tag> />)
    expect(screen.getByText("Test Content")).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Tag className="custom" >Test Content</Tag> />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Tag ref={ref} >Test Content</Tag> />)
    expect(ref.current).not.toBeNull()
  })

  it('spreads extra props via data-testid', () => {
    render(<Tag data-testid="el" >Test Content</Tag> />)
    expect(screen.getByTestId('el')).toBeInTheDocument()
  })

  it('supports aria-label for accessibility', () => {
    render(<Tag aria-label="label" >Test Content</Tag> />)
    expect(screen.getByLabelText('label')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Tag onClick={onClick}>Click me</Tag>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(<Tag><span>Child</span></Tag>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})
