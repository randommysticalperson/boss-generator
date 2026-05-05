import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import MegamanForm, { MegamanFormData } from "@/components/MegamanForm";
import PokemonForm, { PokemonFormData } from "@/components/PokemonForm";
import PreviewPanel from "@/components/PreviewPanel";
import HistoryGallery from "@/components/HistoryGallery";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Zap, Sparkles } from "lucide-react";

type Mode = "megaman" | "pokemon";

interface GenerationResult {
  imageUrl: string;
  prompt: string;
  characterName: string;
  mode: Mode;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("megaman");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const utils = trpc.useUtils();

  const generateMegaman = trpc.generator.generateMegaman.useMutation({
    onSuccess: (data) => {
      setResult({ ...data, mode: "megaman" });
      utils.generator.getHistory.invalidate();
      toast.success("Boss generated successfully!");
    },
    onError: (err) => {
      toast.error(`Generation failed: ${err.message}`);
    },
    onSettled: () => setIsGenerating(false),
  });

  const generatePokemon = trpc.generator.generatePokemon.useMutation({
    onSuccess: (data) => {
      setResult({ ...data, mode: "pokemon" });
      utils.generator.getHistory.invalidate();
      toast.success("Pokémon generated successfully!");
    },
    onError: (err) => {
      toast.error(`Generation failed: ${err.message}`);
    },
    onSettled: () => setIsGenerating(false),
  });

  const handleMegamanGenerate = useCallback((formData: MegamanFormData) => {
    setIsGenerating(true);
    generateMegaman.mutate({ form: formData, extraPrompt });
  }, [extraPrompt, generateMegaman]);

  const handlePokemonGenerate = useCallback((formData: PokemonFormData) => {
    setIsGenerating(true);
    generatePokemon.mutate({ form: formData, extraPrompt });
  }, [extraPrompt, generatePokemon]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.22 250), transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, oklch(0.60 0.24 295), transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.22 250), transparent 60%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm sticky top-0"
        style={{ background: "oklch(0.10 0.015 260 / 0.9)" }}>
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-primary"
                style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 250), oklch(0.60 0.24 295))" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  CharacterForge AI
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Generate legendary characters</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground hidden md:flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Powered by AI image generation</span>
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
            Design a fearsome Mega Man boss or a unique Pokémon — brought to life by AI.
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
            {(["megaman", "pokemon"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  mode === m
                    ? "text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === m ? {
                  background: "linear-gradient(135deg, oklch(0.65 0.22 250), oklch(0.60 0.24 295))",
                  boxShadow: "0 4px 20px oklch(0.65 0.22 250 / 0.4)",
                } : {}}
              >
                {m === "megaman" ? "⚡ Mega Man Boss" : "✨ Custom Pokémon"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main layout: Form + Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Left: Form */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card rounded-2xl p-6 shadow-2xl h-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 rounded-full"
                  style={{ background: mode === "megaman"
                    ? "linear-gradient(180deg, oklch(0.65 0.22 250), oklch(0.55 0.22 220))"
                    : "linear-gradient(180deg, oklch(0.60 0.24 295), oklch(0.70 0.20 160))" }} />
                <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {mode === "megaman" ? "Boss Configuration" : "Pokémon Design"}
                </h3>
              </div>

              <AnimatePresence mode="wait">
                {mode === "megaman" ? (
                  <motion.div key="megaman" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MegamanForm onGenerate={handleMegamanGenerate} isLoading={isGenerating} />
                  </motion.div>
                ) : (
                  <motion.div key="pokemon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PokemonForm onGenerate={handlePokemonGenerate} isLoading={isGenerating} />
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
                  placeholder={mode === "megaman"
                    ? "e.g. glowing red eyes, dramatic storm background, battle-worn armor..."
                    : "e.g. bioluminescent markings, ancient ruins background, mystical aura..."}
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
            <PreviewPanel result={result} isGenerating={isGenerating} mode={mode} />
          </motion.div>
        </div>

        {/* History Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <HistoryGallery />
        </motion.div>
      </main>

      {/* Loading overlay */}
      <AnimatePresence>
        {isGenerating && <LoadingOverlay mode={mode} />}
      </AnimatePresence>
    </div>
  );
}
