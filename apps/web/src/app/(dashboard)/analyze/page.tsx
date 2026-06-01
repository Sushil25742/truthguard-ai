"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'
import { toast } from 'sonner'

import { fetchApi, ApiError } from '@/lib/api-client'

export default function AnalyzePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some news text to analyze')
      return
    }

    if (text.length < 50) {
      toast.error('Text is too short. Please provide at least a paragraph.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetchApi('/predict', {
        method: 'POST',
        body: JSON.stringify({ text })
      })

      setResult({
        prediction: response.prediction,
        confidence_score: response.confidence_score,
        risk_level: response.risk_level,
        explanation: response.explanation,
        suspicious_phrases: response.suspicious_phrases || []
      })
      
      toast.success('Analysis complete')
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof ApiError && err.status === 429) {
        toast.error('Daily prediction limit reached. Upgrade to premium for more.')
      } else if (err instanceof Error) {
        toast.error(err.message || 'Failed to analyze the text. Please try again.')
      } else {
        toast.error('Failed to analyze the text. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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
    <div className="container max-w-6xl py-8 mx-auto px-4 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analyze News Content</h1>
        <p className="text-muted-foreground">Paste an article or news excerpt below to verify its authenticity.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 flex-1">
        <div className="flex flex-col h-full space-y-4">
          <Textarea 
            placeholder="Paste news text here (minimum 50 characters)..." 
            className="flex-1 min-h-[400px] p-6 text-base resize-none shadow-sm border-2 focus-visible:ring-primary/20"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button 
            size="lg" 
            className="w-full text-lg h-14" 
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              'Scan for Fake News'
            )}
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {!result && !loading && (
            <div className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20 text-muted-foreground p-8 text-center">
              <div>
                <ShieldQuestion className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No results yet</p>
                <p className="text-sm">Paste some text and click scan to see the AI analysis</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 border rounded-xl flex items-center justify-center bg-card p-8 text-center shadow-sm">
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium animate-pulse">Running DistilBERT Model...</p>
                <p className="text-sm text-muted-foreground">Analyzing linguistic patterns and semantics</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <Card className="flex-1 border-2 shadow-sm animate-in fade-in zoom-in duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Results</span>
                  {getPredictionIcon(result.prediction)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">PREDICTION</p>
                    <p className={`text-3xl font-bold ${getPredictionColor(result.prediction)}`}>
                      {result.prediction}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">CONFIDENCE</p>
                    <p className="text-3xl font-bold">
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
                  <p className="text-sm leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                {result.suspicious_phrases && (
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

                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Disclaimer:</strong> This is an AI prediction based on linguistic patterns. Always verify claims with trusted fact-checking organizations.
                  </p>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
