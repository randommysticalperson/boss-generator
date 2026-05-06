import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import MegamanForm, { MegamanFormData } from "@/components/MegamanForm";
import MegamanXForm, { MegamanXFormData } from "@/components/MegamanXForm";
import PokemonForm, { PokemonFormData } from "@/components/PokemonForm";
import PreviewPanel from "@/components/PreviewPanel";
import HistoryGallery from "@/components/HistoryGallery";
import LoadingOverlay from "@/components/LoadingOverlay";
import QueuePanel from "@/components/QueuePanel";
import { useGenerationQueue, QueueJob } from "@/hooks/useGenerationQueue";
import { Zap, Sparkles, ListOrdered } from "lucide-react";

type Mode = "megaman" | "megamanx" | "pokemon";

interface GenerationResult {
  imageUrl: string;
  prompt: string;
  characterName: string;
  mode: Mode;
}

const MODE_CONFIG: Record<Mode, {
  label: string;
  icon: string;
  accent: string;
  barGradient: string;
  title: string;
  placeholder: string;
}> = {
  megaman: {
    label: "Mega Man Boss",
    icon: "⚡",
    accent: "oklch(0.65 0.22 250)",
    barGradient: "linear-gradient(180deg, oklch(0.65 0.22 250), oklch(0.55 0.22 220))",
    title: "Boss Configuration",
    placeholder: "e.g. glowing red eyes, dramatic storm background, battle-worn armor...",
  },
  megamanx: {
    label: "Mega Man X",
    icon: "🔵",
    accent: "oklch(0.72 0.22 185)",
    barGradient: "linear-gradient(180deg, oklch(0.72 0.22 185), oklch(0.60 0.22 220))",
    title: "Maverick Design",
    placeholder: "e.g. glowing X buster, neon city background, battle-damaged armor, dramatic lighting...",
  },
  pokemon: {
    label: "Custom Pokémon",
    icon: "✨",
    accent: "oklch(0.60 0.24 295)",
    barGradient: "linear-gradient(180deg, oklch(0.60 0.24 295), oklch(0.70 0.20 160))",
    title: "Pokémon Design",
    placeholder: "e.g. bioluminescent markings, ancient ruins background, mystical aura...",
  },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("megaman");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Store latest form data per mode for "Add to Queue"
  const megamanFormRef = useRef<MegamanFormData | null>(null);
  const megamanXFormRef = useRef<MegamanXFormData | null>(null);
  const pokemonFormRef = useRef<PokemonFormData | null>(null);
  const extraPromptRef = useRef(extraPrompt);
  useEffect(() => { extraPromptRef.current = extraPrompt; }, [extraPrompt]);

  const utils = trpc.useUtils();

  // tRPC mutations used by the queue processor
  const generateMegamanMutation = trpc.generator.generateMegaman.useMutation();
  const generateMegamanXMutation = trpc.generator.generateMegamanX.useMutation();
  const generatePokemonMutation = trpc.generator.generatePokemon.useMutation();

  // The generate function passed to the queue hook
  const generateFn = useCallback(async (job: QueueJob): Promise<{ imageUrl: string; prompt: string; characterName: string }> => {
    if (job.mode === "megaman") {
      const res = await generateMegamanMutation.mutateAsync({
        form: job.formData as unknown as MegamanFormData,
        extraPrompt: job.extraPrompt,
      });
      utils.generator.getHistory.invalidate();
      return res;
    } else if (job.mode === "megamanx") {
      const res = await generateMegamanXMutation.mutateAsync({
        form: job.formData as unknown as MegamanXFormData,
        extraPrompt: job.extraPrompt,
      });
      utils.generator.getHistory.invalidate();
      return res;
    } else {
      const res = await generatePokemonMutation.mutateAsync({
        form: job.formData as unknown as PokemonFormData,
        extraPrompt: job.extraPrompt,
      });
      utils.generator.getHistory.invalidate();
      return res;
    }
  }, [generateMegamanMutation, generateMegamanXMutation, generatePokemonMutation, utils]);

  const queue = useGenerationQueue(generateFn);

  // When a job completes, auto-display in preview panel and show toast
  const prevLatestRef = useRef<string | null>(null);
  useEffect(() => {
    if (queue.latestCompleted && queue.latestCompleted.id !== prevLatestRef.current) {
      prevLatestRef.current = queue.latestCompleted.id;
      setResult({
        imageUrl: queue.latestCompleted.imageUrl!,
        prompt: queue.latestCompleted.prompt!,
        characterName: queue.latestCompleted.characterName,
        mode: queue.latestCompleted.mode,
      });
      toast.success(`${queue.latestCompleted.characterName} generated!`);
    }
  }, [queue.latestCompleted]);

  // Watch for failed jobs
  const prevJobsRef = useRef<QueueJob[]>([]);
  useEffect(() => {
    const newFailed = queue.jobs.filter(
      (j) => j.status === "failed" && !prevJobsRef.current.find((p) => p.id === j.id && p.status === "failed")
    );
    newFailed.forEach((j) => toast.error(`Failed to generate ${j.characterName}: ${j.error ?? "Unknown error"}`));
    prevJobsRef.current = queue.jobs;
  }, [queue.jobs]);

  // Direct generate (immediate, single job) — still supported via the form's Generate button
  const handleDirectGenerate = useCallback((formData: Record<string, unknown>, jobMode: Mode, name: string) => {
    queue.addJob({
      mode: jobMode,
      characterName: name,
      formData: formData as Record<string, unknown>,
      extraPrompt: extraPromptRef.current,
    });
  }, [queue]);

  const handleMegamanGenerate = useCallback((formData: MegamanFormData) => {
    megamanFormRef.current = formData;
    handleDirectGenerate(formData as unknown as Record<string, unknown>, "megaman", formData.name || "Unnamed Boss");
  }, [handleDirectGenerate]); // eslint-disable-line

  const handleMegamanXGenerate = useCallback((formData: MegamanXFormData) => {
    megamanXFormRef.current = formData;
    handleDirectGenerate(formData as unknown as Record<string, unknown>, "megamanx", formData.name || "Unnamed Maverick");
  }, [handleDirectGenerate]); // eslint-disable-line

  const handlePokemonGenerate = useCallback((formData: PokemonFormData) => {
    pokemonFormRef.current = formData;
    handleDirectGenerate(formData as unknown as Record<string, unknown>, "pokemon", formData.name || "Unnamed Pokémon");
  }, [handleDirectGenerate]); // eslint-disable-line

  // "Add to Queue" — adds current form state without starting immediately (queue handles ordering)
  const handleAddToQueue = useCallback(() => {
    let formData: Record<string, unknown> | null = null;
    let name = "Unnamed";

    if (mode === "megaman" && megamanFormRef.current) {
      formData = megamanFormRef.current as unknown as Record<string, unknown>;
      name = megamanFormRef.current.name || "Unnamed Boss";
    } else if (mode === "megamanx" && megamanXFormRef.current) {
      formData = megamanXFormRef.current as unknown as Record<string, unknown>;
      name = megamanXFormRef.current.name || "Unnamed Maverick";
    } else if (mode === "pokemon" && pokemonFormRef.current) {
      formData = pokemonFormRef.current as unknown as Record<string, unknown>;
      name = pokemonFormRef.current.name || "Unnamed Pokémon";
    }

    if (!formData) {
      toast.error("Fill in the form first before adding to queue.");
      return;
    }

    queue.addJob({
      mode,
      characterName: name,
      formData,
      extraPrompt: extraPromptRef.current,
    });
    toast.success(`${name} added to queue!`);
  }, [mode, queue]);

  const handleSelectCompleted = useCallback((job: QueueJob) => {
    if (job.imageUrl && job.prompt) {
      setResult({
        imageUrl: job.imageUrl,
        prompt: job.prompt,
        characterName: job.characterName,
        mode: job.mode,
      });
    }
  }, []);

  const cfg = MODE_CONFIG[mode];
  const isProcessing = queue.isProcessing;
  const processingJob = queue.jobs.find((j) => j.status === "processing");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          key={`bg1-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.10 }}
          transition={{ duration: 0.8 }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${cfg.accent}, transparent 70%)` }}
        />
        <motion.div
          key={`bg2-${mode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.10 }}
          transition={{ duration: 0.8 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(circle, ${cfg.accent}, transparent 70%)` }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: `radial-gradient(circle, ${cfg.accent}, transparent 60%)` }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm sticky top-0"
        style={{ background: "oklch(0.10 0.015 260 / 0.9)" }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-primary"
                style={{ background: `linear-gradient(135deg, ${cfg.accent}, oklch(0.60 0.24 295))` }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  CharacterForge AI
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Generate legendary characters</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Queue badge in header */}
              {queue.jobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>{queue.jobs.length} in queue</span>
                  {isProcessing && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              )}
              <div className="text-xs text-muted-foreground hidden md:flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                <span>Powered by AI image generation</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-3 gradient-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.15 }}>
            Create Your Legend
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Design a fearsome Mega Man boss, a sleek X-series Maverick, or a unique Pokémon — brought to life by AI.
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-2xl p-1.5 flex gap-1 shadow-xl">
            {(["megaman", "megamanx", "pokemon"] as Mode[]).map((m) => {
              const c = MODE_CONFIG[m];
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive ? "text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${c.accent}, oklch(0.55 0.22 220))`,
                    boxShadow: `0 4px 20px ${c.accent.replace(")", " / 0.4)")}`,
                  } : {}}
                >
                  {c.icon} {c.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main layout: Form + Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Left: Form */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card rounded-2xl p-6 shadow-2xl h-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 rounded-full" style={{ background: cfg.barGradient }} />
                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {cfg.title}
                </h3>
              </div>

              <AnimatePresence mode="wait">
                {mode === "megaman" && (
                  <motion.div key="megaman" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MegamanForm
                      onGenerate={handleMegamanGenerate}
                      onFormChange={(data) => { megamanFormRef.current = data; }}
                      isLoading={isProcessing}
                      onAddToQueue={handleAddToQueue}
                    />
                  </motion.div>
                )}
                {mode === "megamanx" && (
                  <motion.div key="megamanx" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MegamanXForm
                      onGenerate={handleMegamanXGenerate}
                      onFormChange={(data) => { megamanXFormRef.current = data; }}
                      isLoading={isProcessing}
                      onAddToQueue={handleAddToQueue}
                    />
                  </motion.div>
                )}
                {mode === "pokemon" && (
                  <motion.div key="pokemon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PokemonForm
                      onGenerate={handlePokemonGenerate}
                      onFormChange={(data) => { pokemonFormRef.current = data; }}
                      isLoading={isProcessing}
                      onAddToQueue={handleAddToQueue}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Extra prompt */}
              <div className="mt-5 pt-5 border-t border-border/50">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Additional Creative Description
                  <span className="text-xs ml-2 opacity-60">(optional)</span>
                </label>
                <textarea
                  value={extraPrompt}
                  onChange={(e) => setExtraPrompt(e.target.value)}
                  placeholder={cfg.placeholder}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{
                    background: "oklch(0.12 0.015 260)",
                    border: "1px solid oklch(0.22 0.02 260)",
                    color: "oklch(0.96 0.005 260)",
                  }}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">{extraPrompt.length}/500</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <PreviewPanel result={result} isGenerating={isProcessing} mode={processingJob?.mode ?? mode} />
          </motion.div>
        </div>

        {/* Queue Panel */}
        <AnimatePresence>
          {queue.jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <QueuePanel
                jobs={queue.jobs}
                isProcessing={queue.isProcessing}
                pendingCount={queue.pendingCount}
                completedCount={queue.completedCount}
                failedCount={queue.failedCount}
                onRemoveJob={queue.removeJob}
                onClearCompleted={queue.clearCompleted}
                onClearAll={queue.clearAll}
                onSelectCompleted={handleSelectCompleted}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <HistoryGallery />
        </motion.div>
      </main>

      {/* Loading overlay — shows only when actively processing */}
      <AnimatePresence>
        {isProcessing && processingJob && (
          <LoadingOverlay mode={processingJob.mode} />
        )}
      </AnimatePresence>
    </div>
  );
}
