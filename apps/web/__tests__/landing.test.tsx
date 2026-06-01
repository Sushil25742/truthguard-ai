import { render, screen } from '@testing-library/react'
import LandingPage from '../src/app/page'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Landing Page', () => {
  it('renders the hero section correctly', () => {
    render(<LandingPage />)
    
    // Check for main heading
    expect(screen.getByText('Detect Fake News Before It Spreads')).toBeInTheDocument()
    
    // Check for subtitle
    expect(screen.getByText(/AI-powered fake news detection/i)).toBeInTheDocument()
    
    // Check for CTA buttons
    const analyzeButton = screen.getByRole('link', { name: /Analyze News/i })
    expect(analyzeButton).toBeInTheDocument()
    expect(analyzeButton).toHaveAttribute('href', '/analyze')
    
    const accountButton = screen.getByRole('link', { name: /Create Free Account/i })
    expect(accountButton).toBeInTheDocument()
    expect(accountButton).toHaveAttribute('href', '/register')
  })
})
