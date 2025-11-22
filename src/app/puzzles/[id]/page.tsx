import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { notFound } from "next/navigation";
import { PuzzleSolver } from "@/components/puzzle-solver";

// Puzzle data structure
const puzzleData: Record<string, {
  id: string;
  title: string;
  status: "unlocked" | "locked";
  difficulty: string;
  description: string;
  loreIntro: string;
  puzzleContent: string;
  hint?: string;
  solution?: string;
}> = {
  "001": {
    id: "001",
    title: "The First Cipher",
    status: "unlocked",
    difficulty: "Novice",
    description: "Your initiation begins with a simple test. The ancients encoded their first message for those who dare to seek the truth.",
    loreIntro: "TRANSMISSION RECEIVED AT 03:33:00\nSIGNAL ORIGIN: UNKNOWN\nENCRYPTION: BASIC SUBSTITUTION\n\nThe first barrier is merely a test of will. Those who proceed beyond this point accept the consequences of uncovering what should remain hidden.",
    puzzleContent: "Decode the following message:\n\nGUR IRVY VF GUVAARQ OL GUBFR JUB FRRX\n\nThe cipher is simple, yet it speaks to the nature of your journey. Each letter has been shifted by a specific number. Find the pattern, reveal the truth.",
    hint: "Consider a rotation cipher. The number 13 holds significance in ancient rituals.",
    solution: "THE VEIL IS THINNED BY THOSE WHO SEEK"
  },
  "002": {
    id: "002",
    title: "Binary Whispers",
    status: "unlocked",
    difficulty: "Intermediate",
    description: "The entities speak in the language of machines. Can you hear their whispers in the digital void?",
    loreIntro: "TRANSMISSION LOG 002\nFREQUENCY: CORRUPTED\nSOURCE: ENTITY_DESIGNATION_UNKNOWN\n\nThey reach through the digital realm, their voices fragmented into binary streams. Only those versed in the tongue of machines can interpret their warnings.",
    puzzleContent: "01010100 01001000 01000101 01011001 00100000 01000001 01010111 01000001 01001011 01000101 01001110\n\nEntity transmission detected. Convert the binary sequence to reveal their message. What do they speak of?",
    hint: "Each group of 8 digits represents a single ASCII character. Decode accordingly.",
    solution: "THEY AWAKEN"
  },
  "003": {
    id: "003",
    title: "Runic Sequence",
    status: "unlocked",
    difficulty: "Advanced",
    description: "Ancient symbols merge with modern code. The boundaries between eras dissolve.",
    loreIntro: "ARCHIVAL FRAGMENT 003\nDATA CORRUPTION: 47%\nTIMESTAMP: TEMPORAL ANOMALY DETECTED\n\nThe symbols predate written history, yet they appear in our digital networks. This should not be possible. This cannot be explained.",
    puzzleContent: "ᚱᛖᚨᛚᛁᛏᛁ ᛁᛋ ᚠᚱᚨᚷᛁᛚᛖ\n\nThe Elder Futhark runes hold power. Each symbol corresponds to a letter. Decipher the ancient warning.",
    hint: "Research Elder Futhark rune alphabet. Each rune has a direct Latin letter equivalent.",
    solution: "REALITY IS FRAGILE"
  },
  "004": {
    id: "004",
    title: "Void Transmission",
    status: "locked",
    difficulty: "Expert",
    description: "Locked until Week 4. Something stirs in the void.",
    loreIntro: "",
    puzzleContent: "[DATA LOCKED]\n\nThis puzzle will be revealed in Week 4. The manifestation is not yet complete.",
  },
  "005": {
    id: "005",
    title: "Temporal Anomaly",
    status: "locked",
    difficulty: "Master",
    description: "Locked until Week 5. Time itself bends around the manifestation.",
    loreIntro: "",
    puzzleContent: "[DATA LOCKED]\n\nThis puzzle will be revealed in Week 5. Wait. Watch. Prepare.",
  },
  "006": {
    id: "006",
    title: "The Architect's Test",
    status: "locked",
    difficulty: "Master",
    description: "Locked until Week 6. The final trial awaits.",
    loreIntro: "",
    puzzleContent: "[DATA LOCKED]\n\nThis puzzle will be revealed in Week 6. Only the worthy will proceed.",
  },
};

export default function PuzzlePage({ params }: { params: { id: string } }) {
  const puzzle = puzzleData[params.id];

  // Return 404 if puzzle doesn't exist
  if (!puzzle) {
    notFound();
  }

  // Check if puzzle is locked
  const isLocked = puzzle.status === "locked";

  return (
    <main className="min-h-screen bg-black relative">
      {/* Dark Background Pattern */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-purple-950/10 to-black"></div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-4 md:px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">THE</span>
          <span className="text-cyan-400 text-lg md:text-xl font-bold tracking-wider">VEIL</span>
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">PROJECT</span>
        </Link>

        <Navigation />
      </nav>

      {/* Back Navigation */}
      <div className="relative z-10 px-8 pt-8">
        <Link
          href="/puzzles"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider">Back to Puzzle Hub</span>
        </Link>
      </div>

      {/* Puzzle Content */}
      <section className="relative z-10 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Puzzle Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block mb-4">
              <span className="text-cyan-400 text-xs font-mono tracking-widest">
                PUZZLE_{puzzle.id}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
              {puzzle.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className={`font-mono font-bold ${
                puzzle.difficulty === "Novice" ? "text-green-400" :
                puzzle.difficulty === "Intermediate" ? "text-yellow-400" :
                puzzle.difficulty === "Advanced" ? "text-orange-400" :
                puzzle.difficulty === "Expert" ? "text-red-400" :
                "text-purple-400"
              }`}>
                {puzzle.difficulty}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{puzzle.description}</span>
            </div>
          </div>

          {isLocked ? (
            /* Locked State */
            <div className="bg-zinc-900/80 border-2 border-zinc-800 rounded-lg p-12 text-center animate-fadeIn">
              <Lock className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4 tracking-wider">
                PUZZLE LOCKED
              </h2>
              <p className="text-gray-400 font-mono mb-8">
                This puzzle will be unlocked in a future transmission. Check back later.
              </p>
              <Link
                href="/puzzles"
                className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all"
              >
                Return to Puzzle Hub
              </Link>
            </div>
          ) : (
            /* Unlocked Puzzle Content */
            <div className="space-y-8 animate-fadeIn">
              {/* Lore Introduction */}
              <div className="bg-zinc-900/80 border border-purple-600/30 rounded-lg p-8">
                <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-wider uppercase">
                  Transmission Log
                </h2>
                <pre className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
{puzzle.loreIntro}
                </pre>
              </div>

              {/* Puzzle Challenge */}
              <div className="bg-zinc-900/80 border-2 border-purple-600 rounded-lg p-8 glow-purple">
                <h2 className="text-2xl font-bold text-white mb-6 tracking-wider uppercase flex items-center gap-3">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  The Challenge
                </h2>
                <div className="bg-black/50 border border-zinc-800 rounded p-6 mb-6">
                  <pre className="text-cyan-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
{puzzle.puzzleContent}
                  </pre>
                </div>

                {/* Answer Submission - Interactive Component */}
                <PuzzleSolver puzzleId={puzzle.id} solution={puzzle.solution || ""} />
              </div>

              {/* Hint Section */}
              {puzzle.hint && (
                <details className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
                  <summary className="text-yellow-400 font-bold uppercase tracking-wider cursor-pointer hover:text-yellow-300 transition-colors">
                    ⚠️ Need a Hint?
                  </summary>
                  <p className="text-gray-400 font-mono text-sm mt-4 leading-relaxed">
                    {puzzle.hint}
                  </p>
                </details>
              )}

              {/* Progress Indicator */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold tracking-wider uppercase mb-1">
                      Puzzle Progress
                    </h3>
                    <p className="text-gray-400 text-sm font-mono">
                      247 users have solved this puzzle
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-mono">Active</span>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link
                  href="/puzzles"
                  className="flex-1 px-6 py-3 border-2 border-purple-600 hover:border-purple-500 text-white font-bold uppercase tracking-wider rounded text-center glow-purple-hover transition-all"
                >
                  Back to Hub
                </Link>
                <Link
                  href="/lore"
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded text-center glow-purple-hover transition-all"
                >
                  View Lore Fragments
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Generate static params for all puzzles
export function generateStaticParams() {
  return [
    { id: "001" },
    { id: "002" },
    { id: "003" },
    { id: "004" },
    { id: "005" },
    { id: "006" },
  ];
}
