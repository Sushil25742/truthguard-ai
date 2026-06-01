"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Users, Activity, ShieldCheck, ShieldAlert, ShieldQuestion, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { fetchApi } from '@/lib/api-client'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsData, usersData] = await Promise.all([
          fetchApi('/admin/stats'),
          fetchApi('/admin/users?limit=10')
        ])
        setStats(statsData)
        setUsers(usersData)
      } catch (err) {
        console.error("Failed to load admin stats", err)
        toast.error("Failed to load admin dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="p-8">
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">Loading stats...</div>
      </div>
    )
  }

  // Calculate percentages for the progress bar chart
  const totalPred = stats.total_predictions || 1
  const fakePct = (stats.prediction_distribution.fake / totalPred) * 100
  const realPct = (stats.prediction_distribution.real / totalPred) * 100
  const uncertainPct = (stats.prediction_distribution.uncertain / totalPred) * 100

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide statistics and overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.predictions_today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total: {stats.total_predictions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fake Detected</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prediction_distribution.fake.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Detected</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prediction_distribution.real.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <ShieldQuestion className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.average_confidence * 100)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_feedback_count.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-8 w-full rounded-full overflow-hidden mb-2 shadow-inner">
            <div style={{ width: `${fakePct}%` }} className="bg-destructive transition-all duration-500 hover:opacity-90" title={`Fake: ${Math.round(fakePct)}%`} />
            <div style={{ width: `${realPct}%` }} className="bg-emerald-500 transition-all duration-500 hover:opacity-90" title={`Real: ${Math.round(realPct)}%`} />
            <div style={{ width: `${uncertainPct}%` }} className="bg-amber-500 transition-all duration-500 hover:opacity-90" title={`Uncertain: ${Math.round(uncertainPct)}%`} />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /> Fake ({Math.round(fakePct)}%)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Real ({Math.round(realPct)}%)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> Uncertain ({Math.round(uncertainPct)}%)</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Recent User Feedback</h3>
          <div className="grid gap-4">
            {stats.recent_feedback.length === 0 ? (
              <div className="p-4 border rounded-lg text-center text-muted-foreground bg-card">No feedback yet.</div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              stats.recent_feedback.map((feedback: any) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4 flex gap-4 items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(feedback.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                      <p className="font-medium text-sm">
                        {feedback.comment || <span className="italic text-muted-foreground">No comment provided</span>}
                      </p>
                    </div>
                    <Badge variant={feedback.is_correct ? 'default' : 'destructive'} className="shrink-0">
                      {feedback.is_correct ? 'Agreed' : 'Disagreed'}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Recent Users</h3>
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={u.role === 'admin' ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {format(new Date(u.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
