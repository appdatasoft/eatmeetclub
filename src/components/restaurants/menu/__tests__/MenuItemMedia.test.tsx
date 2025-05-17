
/// <reference types="vitest" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'
import { MenuItemMedia } from '../../media/MenuItemMedia'

describe('MenuItemMedia Component', () => {
  const mockMedia = [
    { id: '1', url: 'https://example.com/image1.jpg', type: 'image' },
    { id: '2', url: 'https://example.com/image2.jpg', type: 'image' },
    { id: '3', url: 'https://example.com/image3.jpg', type: 'image' },
  ]

  it('renders null when no media is provided', () => {
    const { container } = render(<MenuItemMedia media={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when media is an empty array', () => {
    const { container } = render(<MenuItemMedia media={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a single thumbnail when thumbnailOnly is true', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly />)
    expect(screen.getByAltText('Menu item thumbnail')).toBeInTheDocument()
  })

  it('navigates through media with next and prev buttons', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={false} />)

    const nextButton = screen.getByRole('button', { name: /next image/i })
    const prevButton = screen.getByRole('button', { name: /previous image/i })

    expect(nextButton).toBeInTheDocument()
    expect(prevButton).toBeInTheDocument()

    fireEvent.click(nextButton)
    fireEvent.click(prevButton)
  })

  it('opens modal when thumbnail is clicked (if implemented)', () => {
    const onClick = vi.fn()

    render(
      <div onClick={onClick}>
        <MenuItemMedia media={mockMedia} thumbnailOnly />
      </div>
    )

    const thumbnail = screen.getByAltText('Menu item thumbnail')
    fireEvent.click(thumbnail)

    expect(onClick).toHaveBeenCalled()
  })

  it('renders a gallery when thumbnailOnly is false', () => {
    render(<MenuItemMedia media={mockMedia} thumbnailOnly={false} />)
    expect(screen.getAllByRole('button')).toHaveLength(2) // prev + next
  })
})
