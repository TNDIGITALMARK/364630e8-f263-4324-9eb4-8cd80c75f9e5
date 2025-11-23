'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useSupabase } from '@/lib/zylo/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Character creation steps
const STEPS = {
  ACCOUNT: 0,
  DRIVE: 1,
  FIRST_ACT: 2,
  FEAR: 3,
  NAME: 4,
} as const;

// Ritual choices data
const DRIVES = [
  {
    id: 'power',
    title: 'POWER',
    description: 'The thirst for control over reality itself. You seek dominion over the veil.',
  },
  {
    id: 'knowledge',
    title: 'KNOWLEDGE',
    description: 'The hunger for forbidden truths. You must understand what lies beyond.',
  },
  {
    id: 'survival',
    title: 'SURVIVAL',
    description: 'The primal need to endure. You will outlast the darkness.',
  },
  {
    id: 'connection',
    title: 'CONNECTION',
    description: 'The yearning to reach what was lost. You seek communion across the veil.',
  },
];

const FIRST_ACTS = [
  {
    id: 'witness',
    title: 'THE WITNESS',
    description: 'You saw something you were never meant to see. The veil showed you a glimpse.',
  },
  {
    id: 'betrayal',
    title: 'THE BETRAYAL',
    description: 'Someone you trusted opened the gateway. Now you must close it.',
  },
  {
    id: 'awakening',
    title: 'THE AWAKENING',
    description: 'You woke up different. Changed. The veil has already touched you.',
  },
  {
    id: 'sacrifice',
    title: 'THE SACRIFICE',
    description: 'You gave something precious to gain entry. There is no turning back.',
  },
];

const FEARS = [
  {
    id: 'oblivion',
    title: 'OBLIVION',
    description: 'The fear of being forgotten, of ceasing to exist in all forms.',
  },
  {
    id: 'corruption',
    title: 'CORRUPTION',
    description: 'The fear of losing yourself to the darkness that beckons.',
  },
  {
    id: 'isolation',
    title: 'ISOLATION',
    description: 'The fear of being forever alone in the spaces between worlds.',
  },
  {
    id: 'truth',
    title: 'TRUTH',
    description: 'The fear of discovering that everything you believed was a lie.',
  },
];

export default function CreatePage() {
  const router = useRouter();
  const auth = useAuth();
  const supabase = useSupabase();

  // Step tracking
  const [currentStep, setCurrentStep] = useState(STEPS.ACCOUNT);

  // Account creation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ritual choices
  const [drive, setDrive] = useState('');
  const [firstAct, setFirstAct] = useState('');
  const [fear, setFear] = useState('');
  const [characterName, setCharacterName] = useState('');

  // Progress tracking
  const totalSteps = Object.keys(STEPS).length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAccountCreation = async () => {
    setError(null);

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create account with username as email (username@veil.local)
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@veil.local`;

      await auth.signUp(email, password, {
        username: username,
        metadata: {
          created_via: 'ritual',
        },
      });

      // Move to next step
      setCurrentStep(STEPS.DRIVE);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save character data to Supabase
      const { error: insertError } = await supabase
        .from('characters')
        .insert({
          tenantid: 'hBBKT8j2vVaSYL7InPLklduvMUn1',
          projectid: '364630e8-f263-4324-9eb4-8cd80c75f9e5',
          username: username,
          character_name: characterName,
          drive: drive,
          first_act: firstAct,
          fear: fear,
        });

      if (insertError) {
        console.error('Failed to save character:', insertError);
        // Non-blocking - continue even if save fails
      }

      // Redirect to puzzles area
      router.push('/puzzles');
    } catch (err: any) {
      console.error('Error completing ritual:', err);
      // Non-blocking - redirect anyway
      router.push('/puzzles');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.ACCOUNT:
        return username && password && confirmPassword && password === confirmPassword && password.length >= 8;
      case STEPS.DRIVE:
        return !!drive;
      case STEPS.FIRST_ACT:
        return !!firstAct;
      case STEPS.FEAR:
        return !!fear;
      case STEPS.NAME:
        return characterName.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.ACCOUNT) {
      await handleAccountCreation();
    } else if (currentStep === STEPS.NAME) {
      await handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.ACCOUNT) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Dark Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-purple-950/10 to-black"></div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <nav className="relative z-20 flex justify-between items-center px-4 md:px-8 py-6 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">THE</span>
          <span className="text-cyan-400 text-lg md:text-xl font-bold tracking-wider">VEIL</span>
          <span className="text-white text-lg md:text-xl font-bold tracking-wider">PROJECT</span>
        </Link>

        <div className="text-sm text-gray-400 font-mono">
          STEP {currentStep + 1} / {totalSteps}
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
        <div className="w-full max-w-2xl animate-fadeIn">
          {/* Step 0: Account Creation */}
          {currentStep === STEPS.ACCOUNT && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  BEGIN THE RITUAL
                </h1>
                <p className="text-lg text-gray-400">
                  Choose your identity. This cannot be undone.
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-lg space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-white uppercase tracking-wider">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your ritual name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-zinc-950 border-zinc-700 text-white placeholder:text-gray-600"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-zinc-950 border-zinc-700 text-white"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-500 font-mono">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-white uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-zinc-950 border-zinc-700 text-white"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-900 bg-red-950/30">
                    <AlertDescription className="text-sm text-red-400">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Drive */}
          {currentStep === STEPS.DRIVE && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  WHAT DRIVES YOU?
                </h1>
                <p className="text-lg text-gray-400">
                  Choose the force that compels you forward.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DRIVES.map((driveOption) => (
                  <button
                    key={driveOption.id}
                    onClick={() => setDrive(driveOption.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      drive === driveOption.id
                        ? 'border-purple-600 bg-purple-950/30 glow-purple'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-purple-600/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white tracking-wider">
                        {driveOption.title}
                      </h3>
                      {drive === driveOption.id && (
                        <Check className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      {driveOption.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: First Act */}
          {currentStep === STEPS.FIRST_ACT && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  YOUR FIRST ACT
                </h1>
                <p className="text-lg text-gray-400">
                  How did you come to stand before the veil?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FIRST_ACTS.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setFirstAct(act.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      firstAct === act.id
                        ? 'border-cyan-400 bg-cyan-950/30 glow-cyan'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white tracking-wider">
                        {act.title}
                      </h3>
                      {firstAct === act.id && (
                        <Check className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      {act.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Fear */}
          {currentStep === STEPS.FEAR && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  WHAT DO YOU FEAR?
                </h1>
                <p className="text-lg text-gray-400">
                  Even the bravest harbor dread in their hearts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEARS.map((fearOption) => (
                  <button
                    key={fearOption.id}
                    onClick={() => setFear(fearOption.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      fear === fearOption.id
                        ? 'border-purple-600 bg-purple-950/30 glow-purple'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-purple-600/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white tracking-wider">
                        {fearOption.title}
                      </h3>
                      {fear === fearOption.id && (
                        <Check className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                      {fearOption.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Character Name */}
          {currentStep === STEPS.NAME && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  NAME YOUR AVATAR
                </h1>
                <p className="text-lg text-gray-400">
                  This is how the entities will know you.
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-lg space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="character-name" className="text-sm font-medium text-white uppercase tracking-wider">
                    Character Name
                  </Label>
                  <Input
                    id="character-name"
                    type="text"
                    placeholder="Enter your chosen name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="h-12 bg-zinc-950 border-zinc-700 text-white placeholder:text-gray-600"
                    autoFocus
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Your Ritual Profile
                  </h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Drive:</span>
                      <span className="text-purple-400 uppercase">{drive.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">First Act:</span>
                      <span className="text-cyan-400 uppercase">{firstAct.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fear:</span>
                      <span className="text-purple-400 uppercase">{fear.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 gap-4">
            {currentStep > STEPS.ACCOUNT && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="px-6 py-6 border-zinc-700 text-white hover:bg-zinc-900 hover:border-purple-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="ml-auto px-6 py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider glow-purple-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Creating...'
              ) : currentStep === STEPS.NAME ? (
                <>
                  Complete Ritual
                  <Check className="w-5 h-5 ml-2" />
                </>
              ) : currentStep === STEPS.ACCOUNT ? (
                'Create Account'
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
