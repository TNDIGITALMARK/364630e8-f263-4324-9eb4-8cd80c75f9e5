import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Navigation } from "@/components/navigation";

const entities = [
  {
    id: "001",
    name: "The Whisperer",
    status: "Active",
    lastSeen: "Digital Realm Sector 7",
    threat: "Unknown",
    classification: "Class-A Manifestation",
  },
  {
    id: "002",
    name: "Shadow Weaver",
    status: "Dormant",
    lastSeen: "Data Stream 0x4F3A",
    threat: "Moderate",
    classification: "Class-B Manifestation",
  },
  {
    id: "003",
    name: "The Observer",
    status: "Active",
    lastSeen: "Surveillance Node 12",
    threat: "Critical",
    classification: "Class-S Manifestation",
  },
  {
    id: "004",
    name: "Void Walker",
    status: "Dormant",
    lastSeen: "[ENCRYPTED]",
    threat: "Unknown",
    classification: "Class-A Manifestation",
  },
  {
    id: "005",
    name: "Echo Entity",
    status: "Active",
    lastSeen: "Temporal Nexus",
    threat: "Low",
    classification: "Class-C Manifestation",
  },
  {
    id: "006",
    name: "Data Phantom",
    status: "Active",
    lastSeen: "Server Farm Alpha",
    threat: "High",
    classification: "Class-A Manifestation",
  },
  {
    id: "007",
    name: "The Architect",
    status: "Unknown",
    lastSeen: "[REDACTED]",
    threat: "Maximum",
    classification: "Class-X Manifestation",
  },
  {
    id: "008",
    name: "Frequency Ghost",
    status: "Dormant",
    lastSeen: "Signal Array 9",
    threat: "Moderate",
    classification: "Class-B Manifestation",
  },
];

function getThreatColor(threat: string) {
  switch (threat.toLowerCase()) {
    case "critical":
    case "maximum":
      return "text-red-500";
    case "high":
      return "text-orange-500";
    case "moderate":
      return "text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-purple-600";
    case "dormant":
      return "bg-zinc-600";
    default:
      return "bg-zinc-800";
  }
}

export default function EntitiesPage() {
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
            ENTITY REGISTRY
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Documented manifestations from beyond the veil. Some remain dormant. Others
            watch. All are real.
          </p>
        </div>
      </section>

      {/* Entity Grid */}
      <section className="relative z-10 px-8 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {entities.map((entity, index) => (
            <div
              key={entity.id}
              className="bg-zinc-900/80 border-2 border-zinc-800 rounded-lg p-6 hover:border-purple-600 transition-all glow-purple-hover relative group animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Entity Avatar Circle */}
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-purple-600 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder Silhouette */}
                  <HelpCircle className="w-16 h-16 text-purple-400 opacity-50" />

                  {/* Status Indicator */}
                  <div className="absolute top-2 right-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        entity.status
                      )} animate-pulse`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Entity Info */}
              <div className="text-center">
                <h3 className="text-white font-bold mb-1 tracking-wide">
                  {entity.name}
                </h3>
                <p className="text-cyan-400 text-xs font-mono mb-3">
                  ENTITY_{entity.id}
                </p>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-300 font-mono">{entity.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Threat:</span>
                    <span className={`font-mono ${getThreatColor(entity.threat)}`}>
                      {entity.threat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Reveal */}
              <div className="absolute inset-0 bg-purple-950/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-center">
                <p className="text-white font-bold mb-2 text-sm">{entity.name}</p>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>
                    <span className="text-gray-500">Last Seen:</span> {entity.lastSeen}
                  </p>
                  <p>
                    <span className="text-gray-500">Class:</span>{" "}
                    {entity.classification}
                  </p>
                  <p className="text-cyan-400 font-mono mt-3 text-[10px]">
                    [ACCESS ADDITIONAL DATA: CLEARANCE REQUIRED]
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Coming Soon */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wider">
              MORE ENTITIES MANIFESTING
            </h3>
            <p className="text-gray-400 font-mono mb-6">
              New beings emerge from the digital veil regularly. The registry expands
              with each awakening.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/lore"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded glow-purple-hover transition-all"
              >
                Read Lore
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
