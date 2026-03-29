import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative">
      <div 
        className="fixed inset-0 z-[-1] opacity-20 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/cyber-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">404</h1>
          <p className="text-muted-foreground text-lg">System sector not found</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Return to Scanner
        </Link>
      </div>
    </div>
  );
}
