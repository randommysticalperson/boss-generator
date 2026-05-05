import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle } from "lucide-react";
import { randomizePokemon } from "@/lib/randomizer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface PokemonFormData {
  name: string;
  type1: string;
  type2?: string;
  region: string;
  ability: string;
  move1: string;
  move2?: string;
  personality: string;
  size: "tiny" | "small" | "medium" | "large" | "massive";
  evolutionStage: "basic" | "stage1" | "stage2" | "legendary";
}

const TYPES = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea", "Ancient", "Cosmic", "Volcanic", "Deep Sea", "Tundra", "Jungle"];
const PERSONALITIES = ["Timid", "Bold", "Jolly", "Serious", "Gentle", "Fierce", "Playful", "Mysterious", "Noble", "Wild", "Ancient", "Mischievous"];

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

interface Props {
  onGenerate: (data: PokemonFormData) => void;
  isLoading: boolean;
}

export default function PokemonForm({ onGenerate, isLoading }: Props) {
  const [form, setForm] = useState<PokemonFormData>({
    name: "",
    type1: "",
    type2: "",
    region: "",
    ability: "",
    move1: "",
    move2: "",
    personality: "",
    size: "medium",
    evolutionStage: "basic",
  });
  const [isRandomizing, setIsRandomizing] = useState(false);

  const set = (key: keyof PokemonFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRandomize = useCallback(() => {
    setIsRandomizing(true);
    const randomData = randomizePokemon();
    setForm({
      ...randomData,
      type2: randomData.type2 ?? "",
      move2: randomData.move2 ?? "",
    });
    setTimeout(() => setIsRandomizing(false), 600);
  }, []);

  const isValid = form.name && form.type1 && form.region && form.ability && form.move1 && form.personality;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onGenerate({
      ...form,
      type2: form.type2 || undefined,
      move2: form.move2 || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Randomize button */}
      <motion.div custom={-1} variants={fieldVariants} initial="hidden" animate="visible">
        <button
          type="button"
          onClick={handleRandomize}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40"
          style={{
            background: "oklch(0.18 0.02 260)",
            border: "1px solid oklch(0.28 0.03 260)",
            color: "oklch(0.70 0.24 295)",
          }}
        >
          <motion.div
            animate={isRandomizing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Shuffle className="w-4 h-4" />
          </motion.div>
          <span>Randomize Pokémon</span>
          <AnimatePresence>
            {isRandomizing && (
              <motion.span
                key="flash"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
                style={{ color: "oklch(0.70 0.24 295)" }}
              >
                ✦
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "oklch(0.22 0.02 260)" }} />
        <span className="text-xs text-muted-foreground">or fill manually</span>
        <div className="flex-1 h-px" style={{ background: "oklch(0.22 0.02 260)" }} />
      </div>

      {/* Name */}
      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Pokémon Name <span className="text-destructive">*</span>
        </Label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Embralynx, Crystalvore"
          maxLength={64}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
          style={{
            background: "oklch(0.12 0.015 260)",
            border: "1px solid oklch(0.22 0.02 260)",
            color: "oklch(0.96 0.005 260)",
          }}
        />
      </motion.div>

      {/* Types */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Primary Type <span className="text-destructive">*</span>
          </Label>
          <Select value={form.type1} onValueChange={(v) => set("type1", v)}>
            <SelectTrigger className="rounded-xl" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
              <SelectValue placeholder="Type 1" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Secondary Type <span className="text-xs opacity-60">(optional)</span>
          </Label>
          <Select value={form.type2} onValueChange={(v) => set("type2", v === "none" ? "" : v)}>
            <SelectTrigger className="rounded-xl" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
              <SelectValue placeholder="Type 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {TYPES.filter((t) => t !== form.type1).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Region */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Region of Origin <span className="text-destructive">*</span>
        </Label>
        <Select value={form.region} onValueChange={(v) => set("region", v)}>
          <SelectTrigger className="rounded-xl" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Ability */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Hidden Ability <span className="text-destructive">*</span>
        </Label>
        <input
          type="text"
          value={form.ability}
          onChange={(e) => set("ability", e.target.value)}
          placeholder="e.g. Solar Flare, Void Shroud, Prism Scale"
          maxLength={64}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
          style={{
            background: "oklch(0.12 0.015 260)",
            border: "1px solid oklch(0.22 0.02 260)",
            color: "oklch(0.96 0.005 260)",
          }}
        />
      </motion.div>

      {/* Moves */}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Signature Move <span className="text-destructive">*</span>
          </Label>
          <input
            type="text"
            value={form.move1}
            onChange={(e) => set("move1", e.target.value)}
            placeholder="e.g. Ember Surge"
            maxLength={64}
            className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{
              background: "oklch(0.12 0.015 260)",
              border: "1px solid oklch(0.22 0.02 260)",
              color: "oklch(0.96 0.005 260)",
            }}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Second Move <span className="text-xs opacity-60">(optional)</span>
          </Label>
          <input
            type="text"
            value={form.move2}
            onChange={(e) => set("move2", e.target.value)}
            placeholder="e.g. Crystal Beam"
            maxLength={64}
            className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{
              background: "oklch(0.12 0.015 260)",
              border: "1px solid oklch(0.22 0.02 260)",
              color: "oklch(0.96 0.005 260)",
            }}
          />
        </div>
      </motion.div>

      {/* Personality + Size */}
      <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Personality <span className="text-destructive">*</span>
          </Label>
          <Select value={form.personality} onValueChange={(v) => set("personality", v)}>
            <SelectTrigger className="rounded-xl" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
              <SelectValue placeholder="Select personality" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Size</Label>
          <Select value={form.size} onValueChange={(v) => set("size", v as PokemonFormData["size"])}>
            <SelectTrigger className="rounded-xl" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiny">Tiny</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="massive">Massive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Evolution Stage */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Evolution Stage</Label>
        <div className="grid grid-cols-4 gap-2">
          {(["basic", "stage1", "stage2", "legendary"] as const).map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => set("evolutionStage", stage)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 capitalize ${
                form.evolutionStage === stage ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              style={form.evolutionStage === stage ? {
                background: "linear-gradient(135deg, oklch(0.60 0.24 295), oklch(0.70 0.20 160))",
                boxShadow: "0 2px 12px oklch(0.60 0.24 295 / 0.4)",
              } : {
                background: "oklch(0.12 0.015 260)",
                border: "1px solid oklch(0.22 0.02 260)",
              }}
            >
              {stage === "stage1" ? "Stage 1" : stage === "stage2" ? "Stage 2" : stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Generate Button */}
      <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full h-12 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-40"
          style={{
            background: isValid && !isLoading
              ? "linear-gradient(135deg, oklch(0.60 0.24 295), oklch(0.70 0.20 160))"
              : undefined,
            boxShadow: isValid && !isLoading
              ? "0 4px 24px oklch(0.60 0.24 295 / 0.4)"
              : undefined,
          }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate Pokémon"}
        </Button>
      </motion.div>
    </form>
  );
}
