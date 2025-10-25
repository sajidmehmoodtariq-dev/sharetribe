import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-8">
          <svg width="120" height="120" viewBox="0 0 100 100" className="text-white">
            <text x="50" y="65" fontSize="70" fill="currentColor" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              HH
            </text>
          </svg>
        </div>
        
        <h1 className="text-white text-4xl font-bold mb-3">Head Huntd</h1>
        <p className="text-zinc-400 text-lg mb-12">
          Connect talent with opportunity
        </p>

        <div className="space-y-4">
          <Link href="/signup">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-14 text-lg">
              Get Started
            </Button>
          </Link>
          
          <Link href="/login">
            <Button 
              variant="outline" 
              className="w-full border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 font-semibold h-14 text-lg"
            >
              Log In
            </Button>
          </Link>
        </div>

        <div className="mt-12 space-y-2">
          <p className="text-zinc-400 text-sm">Are you a:</p>
          <div className="flex gap-4 justify-center">
            <Link href="/job-hunter/personal-details" className="text-emerald-500 hover:underline">
              Job Hunter
            </Link>
            <span className="text-zinc-600">|</span>
            <Link href="/signup" className="text-emerald-500 hover:underline">
              Head Hunter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
