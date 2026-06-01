"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ShieldCheck, ShieldAlert, ShieldQuestion, Activity } from 'lucide-react'

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        // Mocking history for now
        await new Promise(r => setTimeout(r, 1000))
        const mockData = [
          { id: 1, text_snippet: "Breaking: Local scientist discovers new element.", prediction: "Real", confidence_score: 0.92, created_at: new Date().toISOString() },
          { id: 2, text_snippet: "Shocking: Aliens land in Central Park, demand pizza.", prediction: "Fake", confidence_score: 0.99, created_at: new Date(Date.now() - 86400000).toISOString() },
        ]
        setHistory(mockData)
      } catch (err) {
        console.error("Failed to load history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const stats = {
    total: history.length + 15,
    fake: history.filter(h => h.prediction === 'Fake').length + 8,
    real: history.filter(h => h.prediction === 'Real').length + 5,
    uncertain: history.filter(h => h.prediction === 'Uncertain').length + 2,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, User</h1>
        <p className="text-muted-foreground">Here is an overview of your recent news analysis.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Lifetime predictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fake Detected</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fake}</div>
            <p className="text-xs text-muted-foreground">Articles flagged as fake</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Detected</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.real}</div>
            <p className="text-xs text-muted-foreground">Articles verified as real</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uncertain Results</CardTitle>
            <ShieldQuestion className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uncertain}</div>
            <p className="text-xs text-muted-foreground">Require manual review</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recent Scans</h3>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-8 border rounded-xl text-center text-muted-foreground bg-card">
            No scans yet. Go to the Analyze page to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((scan) => (
              <Card key={scan.id}>
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(scan.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                    <p className="font-medium line-clamp-2">{scan.text_snippet}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Prediction</p>
                      <p className={`font-bold ${
                        scan.prediction === 'Real' ? 'text-emerald-500' : 
                        scan.prediction === 'Fake' ? 'text-destructive' : 'text-amber-500'
                      }`}>
                        {scan.prediction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="font-bold">{Math.round(scan.confidence_score * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
