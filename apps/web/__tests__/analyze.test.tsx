import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalyzePage from '../src/app/(dashboard)/analyze/page'
import { fetchApi } from '@/lib/api-client'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('next/link', () => ({ children }: any) => <a>{children}</a>)
jest.mock('@/lib/api-client', () => ({
  fetchApi: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(msg: string, status: number) { super(msg); this.status = status; }
  }
}))

describe('Analyze Page', () => {
  it('rejects short text', async () => {
    render(<AnalyzePage />)
    const textarea = screen.getByPlaceholderText(/Paste the news article or text here/i)
    fireEvent.change(textarea, { target: { value: 'Too short' } })
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Text/i })
    fireEvent.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/Text must be at least 50 characters/i)).toBeInTheDocument()
    })
  })

  it('displays prediction result correctly', async () => {
    (fetchApi as jest.Mock).mockResolvedValueOnce({
      prediction: 'Fake',
      confidence_score: 0.95,
      risk_level: 'High',
      explanation: 'Test explanation',
      suspicious_phrases: ['test']
    })

    render(<AnalyzePage />)
    const textarea = screen.getByPlaceholderText(/Paste the news article or text here/i)
    
    const validText = 'This is a valid text that is long enough to bypass the fifty character minimum requirement for the application.'
    fireEvent.change(textarea, { target: { value: validText } })
    
    const submitBtn = screen.getByRole('button', { name: /Analyze Text/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Fake/i)).toBeInTheDocument()
      expect(screen.getByText(/95%/i)).toBeInTheDocument()
      expect(screen.getByText(/Test explanation/i)).toBeInTheDocument()
    })
  })
})
