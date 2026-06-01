export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-muted/10">
      <main className="container mx-auto py-8">
        {children}
      </main>
    </div>
  )
}
