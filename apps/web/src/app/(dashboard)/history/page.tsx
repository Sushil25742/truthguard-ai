"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fetchApi } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await fetchApi('/predictions')
        setHistory(data)
      } catch (err) {
        console.error("Failed to load history", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Scan History</h1>
        <p className="text-muted-foreground">View all your previous fake news analysis records.</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No scan history found.
                </TableCell>
              </TableRow>
            ) : (
              history.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(scan.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      scan.prediction === 'Real' ? 'text-emerald-500' : 
                      scan.prediction === 'Fake' ? 'text-destructive' : 'text-amber-500'
                    }`}>
                      {scan.prediction}
                    </span>
                  </TableCell>
                  <TableCell>
                    {Math.round(scan.confidence_score * 100)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      scan.risk_level === 'High' ? 'destructive' : 
                      scan.risk_level === 'Medium' ? 'default' : 'secondary'
                    }>
                      {scan.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/history/${scan.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
