"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ShieldAlert, ShieldQuestion, ArrowLeft, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { fetchApi, ApiError } from '@/lib/api-client'

export default function HistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await fetchApi(`/predictions/${params.id}`)
        setResult(data)
      } catch (err) {
        console.error(err)
        toast.error("Failed to load details")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchDetail()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prediction history?')) return
    try {
      await fetchApi(`/predictions/${params.id}`, { method: 'DELETE' })
      toast.success("Prediction deleted")
      router.push('/history')
    } catch (err) {
      toast.error("Failed to delete prediction")
      console.error(err)
    }
  }

  const handleFeedback = async (isCorrect: boolean) => {
    try {
      await fetchApi(`/predictions/${params.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ is_correct: isCorrect, comment: null })
      })
      setFeedbackSent(true)
      toast.success(isCorrect ? "Thanks for confirming!" : "Thanks for your feedback, we'll improve our model.")
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error("You have already submitted feedback for this prediction")
        setFeedbackSent(true)
      } else {
        toast.error("Failed to submit feedback")
      }
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading details...</div>
  }

  if (!result) {
    return <div className="p-8 text-center text-muted-foreground">Result not found.</div>
  }

  const getPredictionColor = (prediction: string) => {
    if (prediction === 'Real') return 'text-emerald-500'
    if (prediction === 'Fake') return 'text-destructive'
    return 'text-amber-500'
  }

  const getPredictionIcon = (prediction: string) => {
    if (prediction === 'Real') return <ShieldCheck className="w-8 h-8 text-emerald-500" />
    if (prediction === 'Fake') return <ShieldAlert className="w-8 h-8 text-destructive" />
    return <ShieldQuestion className="w-8 h-8 text-amber-500" />
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/history" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Link>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed p-4 bg-muted/30 rounded-lg">
                {result.text_snippet}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Help Us Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Was this AI prediction accurate? Your feedback helps train our models.
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600"
                  disabled={feedbackSent}
                  onClick={() => handleFeedback(true)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" /> Correct
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  disabled={feedbackSent}
                  onClick={() => handleFeedback(false)}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" /> Incorrect
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border-2 sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Analysis</span>
                {getPredictionIcon(result.prediction)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">PREDICTION</p>
                  <p className={`text-2xl font-bold ${getPredictionColor(result.prediction)}`}>
                    {result.prediction}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">CONFIDENCE</p>
                  <p className="text-2xl font-bold">
                    {Math.round(result.confidence_score * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">RISK LEVEL</h4>
                <Badge variant={result.risk_level === 'High' ? 'destructive' : 'default'} className="text-sm px-3 py-1">
                  {result.risk_level} Risk
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">EXPLANATION</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.explanation}
                </p>
              </div>

              {result.suspicious_phrases && result.suspicious_phrases.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">SUSPICIOUS PHRASES</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suspicious_phrases.map((phrase: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        &quot;{phrase}&quot;
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
