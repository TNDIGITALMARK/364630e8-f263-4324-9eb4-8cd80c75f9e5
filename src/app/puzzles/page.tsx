import Link from "next/link";
import { Lock, Unlock, Clock } from "lucide-react";
import { Navigation } from "@/components/navigation";

const puzzles = [
  {
    id: "001",
    title: "The First Cipher",
    status: "unlocked",
    difficulty: "Novice",
    completions: 247,
    dropDate: "Week 1",
  },
  {
    id: "002",
    title: "Binary Whispers",
    status: "unlocked",
    difficulty: "Intermediate",
    completions: 189,
    dropDate: "Week 2",
  },
  {
    id: "003",
    title: "Runic Sequence",
    status: "unlocked",
    difficulty: "Advanced",
    completions: 94,
    dropDate: "Week 3",
  },
  {
    id: "004",
    title: "Void Transmission",
    status: "locked",
    difficulty: "Expert",
    completions: 0,
    dropDate: "Week 4",
  },
  {
    id: "005",
    title: "Temporal Anomaly",
    status: "locked",
    difficulty: "Master",
    completions: 0,
    dropDate: "Week 5",
  },
  {
    id: "006",
    title: "The Architect's Test",
    status: "locked",
    difficulty: "Master",
    completions: 0,
    dropDate: "Week 6",
  },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "novice":
      return "text-green-400";
    case "intermediate":
      return "text-yellow-400";
    case "advanced":
      return "text-orange-400";
    case "expert":
      return "text-red-400";
    case "master":
      return "text-purple-400";
    default:
      return "text-gray-400";
  }
}

export default function PuzzlesPage() {
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

      {/* Header */}
      <section className="relative z-10 px-8 py-16">
        <div className="max-w-7xl mx-auto text-center animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-wider">
            PUZZLE HUB
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Ancient riddles encoded in digital form. New challenges manifest each week.
            Solve them to unlock deeper truths.
          </p>

          {/* Next Drop Countdown */}
          <div className="inline-flex items-center gap-3 bg-purple-950/30 border border-purple-600/30 px-6 py-3 rounded-full">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-mono text-sm">
              NEXT DROP: <span className="text-cyan-400">4 DAYS 12 HOURS</span>
            </span>
          </div>
        </div>
      </section>

      {/* Puzzle Grid */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {puzzles.map((puzzle, index) => {
            const CardWrapper = puzzle.status === "locked" ? "div" : Link;
            const cardProps = puzzle.status === "locked"
              ? {}
              : { href: `/puzzles/${puzzle.id}` };

            return (
              <CardWrapper
                key={puzzle.id}
                {...cardProps}
                className={`relative bg-zinc-900/80 border-2 rounded-lg p-8 transition-all animate-fadeIn block ${
                  puzzle.status === "locked"
                    ? "border-zinc-800 opacity-60"
                    : "border-zinc-800 hover:border-purple-600 glow-purple-hover cursor-pointer"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
              {/* Hexagon Visual */}
              <div className="relative mb-6">
                <div
                  className={`w-32 h-32 mx-auto flex items-center justify-center relative ${
                    puzzle.status === "locked" ? "opacity-50" : ""
                  }`}
                >
                  {/* Hexagon Shape using CSS */}
                  <div className="relative w-24 h-28 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full absolute inset-0"
                    >
                      <polygon
                        points="50 1 95 25 95 75 50 99 5 75 5 25"
                        fill="#18181b"
                        stroke={puzzle.status === "locked" ? "#3f3f46" : "#8b5cf6"}
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Icon */}
                    {puzzle.status === "locked" ? (
                      <Lock className="w-10 h-10 text-cyan-400 z-10" />
                    ) : (
                      <Unlock className="w-10 h-10 text-cyan-400 z-10" />
                    )}
                  </div>

                  {/* Badge Number */}
                  {puzzle.status === "unlocked" && puzzle.completions > 0 && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-2 border-black">
                      <span className="text-white text-xs font-bold">
                        {puzzle.completions > 99 ? "99+" : puzzle.completions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Puzzle Info */}
              <div className="text-center">
                <p className="text-cyan-400 text-xs font-mono mb-1">
                  PUZZLE_{puzzle.id}
                </p>
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                  {puzzle.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span
                      className={`font-mono font-bold ${getDifficultyColor(
                        puzzle.difficulty
                      )}`}
                    >
                      {puzzle.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Drop:</span>
                    <span className="text-gray-300 font-mono">{puzzle.dropDate}</span>
                  </div>
                  {puzzle.status === "unlocked" && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Solved:</span>
                      <span className="text-gray-300 font-mono">
                        {puzzle.completions} users
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {puzzle.status === "locked" ? (
                  <div className="text-xs text-gray-500 font-mono pt-3 border-t border-zinc-800">
                    UNLOCKS {puzzle.dropDate.toUpperCase()}
                  </div>
                ) : (
                  <div className="w-full px-4 py-2 bg-purple-600 text-white font-bold uppercase text-sm tracking-wider rounded transition-all text-center">
                    Access Puzzle
                  </div>
                )}
              </div>

              {/* Locked Overlay */}
              {puzzle.status === "locked" && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm font-mono">LOCKED</p>
                  </div>
                </div>
              )}
            </CardWrapper>
            );
          })}
        </div>

        {/* Access Archive */}
        <div className="max-w-6xl mx-auto mt-12 text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wider">
              ACCESS THE ARCHIVE
            </h3>
            <p className="text-gray-400 font-mono mb-6">
              Completed puzzles unlock additional lore fragments and entity data. The
              deeper you go, the more you understand.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/lore"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all"
              >
                View Lore Fragments
              </Link>
              <Link
                href="/"
                className="inline-block px-6 py-3 border-2 border-purple-600 hover:border-purple-500 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all"
              >
                Return to Gateway
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
