import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
          Detect Fake News Before It Spreads
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered fake news detection using BERT-based NLP.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/analyze">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold">
              Analyze News Now
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl text-left">
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">AI fake news detection</h3>
          <p className="text-muted-foreground text-sm">
            Powered by advanced DistilBERT models to understand context and detect misinformation.
          </p>
        </div>
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">Confidence score</h3>
          <p className="text-muted-foreground text-sm">
            Get an exact percentage representing the model&apos;s confidence in its prediction.
          </p>
        </div>
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">Explanation</h3>
          <p className="text-muted-foreground text-sm">
            Understand exactly why the article was flagged as fake, real, or uncertain.
          </p>
        </div>
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">Suspicious phrase detection</h3>
          <p className="text-muted-foreground text-sm">
            Highlights specific keywords and sentences that trigger fake news patterns.
          </p>
        </div>
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">Secure history</h3>
          <p className="text-muted-foreground text-sm">
            Your scanned articles are securely logged to your dashboard for future reference.
          </p>
        </div>
        <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold mb-2 text-primary">Free student-friendly tool</h3>
          <p className="text-muted-foreground text-sm">
            Enjoy up to 50 free scans daily. Built with accessibility and learning in mind.
          </p>
        </div>
      </div>
    </div>
  )
}
