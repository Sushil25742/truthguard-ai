import Link from 'next/link'


export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">TruthGuard AI</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link href="/analyze" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Analyze News
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
