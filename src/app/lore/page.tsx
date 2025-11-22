import Link from "next/link";
import { Info } from "lucide-react";
import { Navigation } from "@/components/navigation";

const loreFragments = [
  {
    id: "001",
    title: "First Transmission",
    content:
      "The first transmission arrived at 03:33 AM. Signal origin: [REDACTED]. Message: The sleepers are awakening. Recommend immediate containment protocol. Neural patterns suggest consciousness transfer between dimensions. Subject exhibited unprecedented activity during exposure to the frequencies.",
    date: "2024-11-15",
    classification: "Level 5",
  },
  {
    id: "007",
    title: "Archaeological Discovery",
    content:
      "Archaeological dig site 7 uncovered symbols matching the digital manifestations. Age: approximately [DATA CORRUPTED] years. Symbols predate known civilization by millennia. Carbon dating inconclusive. Team members report vivid dreams of geometric patterns and whispered languages.",
    date: "2024-11-18",
    classification: "Level 8",
  },
  {
    id: "013",
    title: "Neural Activity Report",
    content:
      "Subject exhibited unprecedented neural activity during exposure to the frequencies. Recommend immediate [ACCESS DENIED]. Brainwave patterns match those found in ancient temple carvings. Subject claims to hear voices speaking in binary. Isolation protocols engaged.",
    date: "2024-11-22",
    classification: "Level 9",
  },
  {
    id: "021",
    title: "Digital Anomaly",
    content:
      "Server logs reveal unauthorized access at timestamp [EXPUNGED]. Source IP traces to coordinates that don't exist. Data packets contain embedded runic sequences. AI analysis suggests non-human origin. Firewall ineffective against penetration method.",
    date: "2024-11-25",
    classification: "Level 7",
  },
  {
    id: "033",
    title: "The Whispering Protocol",
    content:
      "Intercepted communications between manifested entities suggest coordinated awakening event. Translation incomplete but references 'the thin places' and 'digital gateways'. Entities appear to communicate through quantum entanglement. Traditional encryption methods obsolete.",
    date: "2024-11-29",
    classification: "Level 10",
  },
  {
    id: "042",
    title: "Manifestation Cycle",
    content:
      "Manifestation events correlate with astronomical alignments. Next predicted occurrence: [REDACTED]. Historic records show similar patterns dating back to [DATA LOST]. Ancient texts refer to these as 'thinning seasons' when barriers between realms weaken.",
    date: "2024-12-02",
    classification: "Level 6",
  },
];

export default function LorePage() {
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
            LORE FRAGMENTS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Recovered transmissions from the digital veil. Some truths are best left
            encrypted. Read at your own risk.
          </p>
        </div>
      </section>

      {/* Lore Fragment Grid */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loreFragments.map((fragment, index) => (
            <div
              key={fragment.id}
              className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-lg hover:border-purple-600 transition-all glow-purple-hover relative animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Info Icon */}
              <div className="absolute top-4 right-4">
                <Info className="w-5 h-5 text-gray-600" />
              </div>

              {/* Fragment Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-cyan-400 font-mono text-sm">
                    FRAGMENT_{fragment.id}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">
                    {fragment.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {fragment.title}
                </h3>
              </div>

              {/* Fragment Content */}
              <p className="text-gray-400 text-sm font-mono leading-relaxed mb-4">
                {fragment.content}
              </p>

              {/* Classification */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-xs text-gray-600 uppercase tracking-wider">
                  Classification
                </span>
                <span className="text-xs font-mono text-purple-400">
                  {fragment.classification}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* More Coming Soon */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wider">
              MORE FRAGMENTS INCOMING
            </h3>
            <p className="text-gray-400 font-mono mb-6">
              New transmissions manifest weekly. The veil grows thinner with each
              revelation.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all"
            >
              Return to Gateway
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
