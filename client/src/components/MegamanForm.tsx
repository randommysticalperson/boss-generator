import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { randomizeMegaman } from "@/lib/randomizer";

export interface MegamanFormData {
  name: string;
  element: string;
  weaponName: string;
  weaknessElement: string;
  armorColor: string;
  secondaryColor: string;
  personality: string;
  difficulty: "easy" | "medium" | "hard" | "brutal";
  specialAbility?: string;
}

const ELEMENTS = ["Fire", "Ice", "Electric", "Water", "Wind", "Earth", "Shadow", "Light", "Metal", "Wood", "Gravity", "Time", "Magnet", "Bubble", "Crystal", "Acid"];
const PERSONALITIES = ["Aggressive", "Cunning", "Stoic", "Berserker", "Tactical", "Arrogant", "Honorable", "Chaotic", "Calm", "Ruthless"];
const COLORS = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Cyan", "Gold", "Silver", "Black", "White", "Pink", "Teal", "Crimson", "Indigo"];

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

interface Props {
  onGenerate: (data: MegamanFormData) => void;
  isLoading: boolean;
}

export default function MegamanForm({ onGenerate, isLoading }: Props) {
  const [form, setForm] = useState<MegamanFormData>({
    name: "",
    element: "",
    weaponName: "",
    weaknessElement: "",
    armorColor: "",
    secondaryColor: "",
    personality: "",
    difficulty: "medium",
    specialAbility: "",
  });
  const [isRandomizing, setIsRandomizing] = useState(false);

  const set = (key: keyof MegamanFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRandomize = useCallback(() => {
    setIsRandomizing(true);
    const randomData = randomizeMegaman();
    setForm(randomData);
    setTimeout(() => setIsRandomizing(false), 600);
  }, []);

  const isValid = form.name && form.element && form.weaponName && form.weaknessElement && form.armorColor && form.secondaryColor && form.personality;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onGenerate(form);
  };

  const inputStyle = {
    background: "oklch(0.12 0.015 260)",
    border: "1px solid oklch(0.22 0.02 260)",
    color: "oklch(0.96 0.005 260)",
  };

  const selectTriggerStyle = {
    background: "oklch(0.12 0.015 260)",
    border: "1px solid oklch(0.22 0.02 260)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Randomize button */}
      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
        <button
          type="button"
          onClick={handleRandomize}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40"
          style={{
            background: "oklch(0.18 0.02 260)",
            border: "1px solid oklch(0.28 0.03 260)",
            color: "oklch(0.75 0.22 250)",
          }}
        >
          <motion.div
            animate={isRandomizing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Shuffle className="w-4 h-4" />
          </motion.div>
          <span>Randomize Boss</span>
          <AnimatePresence>
            {isRandomizing && (
              <motion.span
                key="flash"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
                style={{ color: "oklch(0.75 0.22 250)" }}
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
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Boss Name <span className="text-destructive">*</span>
        </Label>
        <motion.input
          key={isRandomizing ? `name-${form.name}` : "name-static"}
          animate={isRandomizing ? { borderColor: "oklch(0.65 0.22 250)", scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 0.3 }}
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Flame Titan Man"
          maxLength={64}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={inputStyle}
        />
      </motion.div>

      {/* Element + Weakness */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Element <span className="text-destructive">*</span>
          </Label>
          <Select value={form.element} onValueChange={(v) => set("element", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select element" />
            </SelectTrigger>
            <SelectContent>
              {ELEMENTS.map((el) => <SelectItem key={el} value={el}>{el}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Weakness <span className="text-destructive">*</span>
          </Label>
          <Select value={form.weaknessElement} onValueChange={(v) => set("weaknessElement", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select weakness" />
            </SelectTrigger>
            <SelectContent>
              {ELEMENTS.filter((el) => el !== form.element).map((el) => <SelectItem key={el} value={el}>{el}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Weapon Name */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Signature Weapon <span className="text-destructive">*</span>
        </Label>
        <input
          type="text"
          value={form.weaponName}
          onChange={(e) => set("weaponName", e.target.value)}
          placeholder="e.g. Inferno Blade, Thunder Cannon"
          maxLength={64}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={inputStyle}
        />
      </motion.div>

      {/* Armor Colors */}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Primary Armor Color <span className="text-destructive">*</span>
          </Label>
          <Select value={form.armorColor} onValueChange={(v) => set("armorColor", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Primary color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Secondary Color <span className="text-destructive">*</span>
          </Label>
          <Select value={form.secondaryColor} onValueChange={(v) => set("secondaryColor", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Secondary color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.filter((c) => c !== form.armorColor).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Personality + Difficulty */}
      <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Personality <span className="text-destructive">*</span>
          </Label>
          <Select value={form.personality} onValueChange={(v) => set("personality", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select personality" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Difficulty</Label>
          <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v as MegamanFormData["difficulty"])}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="brutal">Brutal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Special Ability */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Special Ability <span className="text-xs opacity-60">(optional)</span>
        </Label>
        <input
          type="text"
          value={form.specialAbility}
          onChange={(e) => set("specialAbility", e.target.value)}
          placeholder="e.g. Phase through walls, summon minions"
          maxLength={128}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={inputStyle}
        />
      </motion.div>

      {/* Generate Button */}
      <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full h-12 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-40"
          style={{
            background: isValid && !isLoading
              ? "linear-gradient(135deg, oklch(0.65 0.22 250), oklch(0.60 0.24 295))"
              : undefined,
            boxShadow: isValid && !isLoading
              ? "0 4px 24px oklch(0.65 0.22 250 / 0.4)"
              : undefined,
          }}
        >
          <Zap className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate Boss"}
        </Button>
      </motion.div>
    </form>
  );
}
