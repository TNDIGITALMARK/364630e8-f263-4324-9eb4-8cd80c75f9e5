import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/generated/cosmic-background.png"
          alt=""
          fill
          className="object-cover opacity-60"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-4 md:px-8 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">THE</span>
          <span className="text-cyan-400 text-lg md:text-xl font-bold tracking-wider">VEIL</span>
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">PROJECT</span>
        </Link>

        <Navigation />
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Floating Runic Symbols */}
        <div className="absolute w-full h-full">
          <Image
            src="/generated/runic-symbol-1.png"
            alt=""
            width={80}
            height={80}
            className="absolute top-[20%] left-[15%] animate-float opacity-80"
          />
          <Image
            src="/generated/runic-symbol-2.png"
            alt=""
            width={80}
            height={80}
            className="absolute top-[25%] right-[15%] animate-float opacity-80"
            style={{ animationDelay: "1s" }}
          />
          <Image
            src="/generated/runic-symbol-3.png"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-[30%] left-[20%] animate-float opacity-80"
            style={{ animationDelay: "2s" }}
          />
          <Image
            src="/generated/runic-symbol-4.png"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-[25%] right-[20%] animate-float opacity-80"
            style={{ animationDelay: "3s" }}
          />
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-wider">
            THERE IS SOMETHING<br />BEYOND THE VEIL
          </h1>

          <p className="text-xl text-gray-400 mb-12 tracking-wide">
            Ancient forces stir in the digital realm. The manifestation begins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              href="/lore"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all text-center"
            >
              Begin Ritual
            </Link>
            <Link
              href="/entities"
              className="px-8 py-4 border-2 border-purple-600 hover:border-purple-500 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all text-center"
            >
              View Entities
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Preview Sections */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lore Preview */}
          <Link
            href="/lore"
            className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-lg hover:border-purple-600 transition-all glow-purple-hover"
          >
            <h3 className="text-xl font-bold text-white mb-3 tracking-wider">LORE FRAGMENTS</h3>
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              The first transmission arrived at 03:33 AM. Signal origin: [REDACTED]. Message: The sleepers are awakening...
            </p>
          </Link>

          {/* Puzzle Preview */}
          <Link
            href="/puzzles"
            className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-lg hover:border-purple-600 transition-all glow-purple-hover"
          >
            <h3 className="text-xl font-bold text-white mb-3 tracking-wider">PUZZLE HUB</h3>
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              Weekly drops. Ancient riddles. Digital transmissions. Unlock the mysteries before the manifestation completes...
            </p>
          </Link>

          {/* Entity Preview */}
          <Link
            href="/entities"
            className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-lg hover:border-purple-600 transition-all glow-purple-hover"
          >
            <h3 className="text-xl font-bold text-white mb-3 tracking-wider">ENTITY REGISTRY</h3>
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              They manifest through the digital veil. Some dormant. Some active. All watching. Classification: [ENCRYPTED]...
            </p>
          </Link>
        </div>
      </section>

      {/* Footer with Email Signup */}
      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-900/50 px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-lg mb-2 tracking-wider">READY TO TRANSCEND?</h3>
            <p className="text-gray-400 text-sm">Join the ritual protocol for exclusive transmissions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.void"
              className="px-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded focus:border-purple-600 outline-none w-full sm:w-64"
            />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all whitespace-nowrap text-sm sm:text-base">
              Join Protocol
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center text-sm text-gray-500">
          <p>© 2025 THE VEIL PROJECT</p>
          <div className="flex gap-6">
            <Link href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link href="#terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}