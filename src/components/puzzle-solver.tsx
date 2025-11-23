"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PuzzleSolverProps {
  puzzleId: string;
  solution: string;
}

export function PuzzleSolver({ puzzleId, solution }: PuzzleSolverProps) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "hint" | null;
    message: string;
  }>({ type: null, message: "" });
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter an answer before submitting.",
      });
      return;
    }

    // Normalize answers for comparison (remove extra spaces, convert to uppercase)
    const normalizedAnswer = answer.trim().toUpperCase().replace(/\s+/g, " ");
    const normalizedSolution = solution.toUpperCase().replace(/\s+/g, " ");

    setAttempts(attempts + 1);

    if (normalizedAnswer === normalizedSolution) {
      setFeedback({
        type: "success",
        message: "✓ CORRECT! The veil grows thinner. You have unlocked deeper truths.",
      });
      setSolved(true);
    } else {
      // Provide feedback without hints
      setFeedback({
        type: "error",
        message: "Incorrect. The cipher remains unbroken. Try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Feedback Message */}
      {feedback.type && (
        <div
          className={`p-4 rounded-lg border-2 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-green-950/30 border-green-600 text-green-400"
              : feedback.type === "hint"
              ? "bg-yellow-950/30 border-yellow-600 text-yellow-400"
              : "bg-red-950/30 border-red-600 text-red-400"
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : feedback.type === "hint" ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-mono text-sm leading-relaxed">{feedback.message}</p>
              {feedback.type === "success" && (
                <p className="text-xs mt-2 opacity-80">
                  Puzzle solved in {attempts} attempt{attempts !== 1 ? "s" : ""}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Answer Input Form */}
      {!solved && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Enter Your Solution:
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your decoded message..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 text-white rounded focus:border-cyan-400 outline-none font-mono transition-colors"
              disabled={solved}
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={solved}
          >
            Submit Answer
          </button>
          {attempts > 0 && !solved && (
            <p className="text-center text-gray-500 text-xs font-mono">
              Attempts: {attempts}
            </p>
          )}
        </form>
      )}

      {/* Solved State Actions */}
      {solved && (
        <div className="bg-zinc-900/60 border border-green-600/30 rounded-lg p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 tracking-wider uppercase">
            Puzzle Completed
          </h3>
          <p className="text-gray-400 text-sm font-mono mb-6">
            You have proven yourself worthy. Continue your journey to unlock the deeper mysteries of the Veil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/puzzles"
              className="flex-1 px-6 py-3 border-2 border-purple-600 hover:border-purple-500 text-white font-bold uppercase tracking-wider rounded text-center transition-all"
            >
              Next Puzzle
            </a>
            <a
              href="/lore"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider rounded text-center transition-all"
            >
              View Unlocked Lore
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
