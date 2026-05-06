import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { randomizeMegamanX } from "@/lib/randomizer";

export interface MegamanXFormData {
  name: string;
  animalBase: string;
  element: string;
  armorColor: string;
  secondaryColor: string;
  chargedShot: string;
  dashType: string;
  armorUpgrade: string;
  personality: string;
  threatLevel: "low" | "medium" | "high" | "sigma-class";
  rivalry?: string;
}

const ELEMENTS = [
  "Fire", "Ice", "Electric", "Wind", "Earth", "Water", "Shadow", "Light",
  "Gravity", "Crystal", "Magma", "Plasma", "Acid", "Void", "Cyber", "Toxic",
];

const ANIMALS = [
  "Wolf", "Eagle", "Shark", "Tiger", "Rhino", "Crab", "Moth", "Armadillo",
  "Chameleon", "Octopus", "Hornet", "Falcon", "Mantis", "Scorpion", "Bat",
  "Panther", "Cobra", "Beetle", "Mammoth", "Peacock", "Squid", "Crow",
  "Alligator", "Bison", "Dragonfly", "Stingray", "Gorilla", "Cheetah",
];

const COLORS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Cyan", "Gold",
  "Silver", "Black", "White", "Pink", "Teal", "Crimson", "Indigo", "Violet",
];

const CHARGED_SHOTS = [
  "Homing missiles", "Spread fire burst", "Charged plasma beam",
  "Ice crystal shards", "Thunder wave ring", "Gravity well orb",
  "Flame pillar strike", "Void energy lance", "Acid rain volley",
  "Crystal spike barrage", "Wind blade cyclone", "Shadow clone shot",
  "Magma eruption blast", "Cyber virus bolt", "Toxic cloud bomb",
  "Sonic boom slash", "Laser ricochet", "Seismic ground pound",
];

const DASH_TYPES = [
  "Air dash (horizontal)", "Air dash (any direction)", "Double air dash",
  "Ground dash only", "Teleport dash", "Drill dash through walls",
  "Flame trail dash", "Ice freeze dash", "Gravity flip dash",
  "Shadow step dash", "Hyper speed burst", "Charge-cancel dash",
];

const ARMOR_UPGRADES = [
  "Fourth Armor (Ultimate)", "Giga Armor", "Shadow Armor", "Falcon Armor",
  "Blade Armor", "Neutral Armor", "Glitch Armor", "Dark Armor",
  "Stealth Armor", "Siege Armor", "Prism Armor", "None (unarmored)",
];

const PERSONALITIES = [
  "Loyal-turned-Maverick", "Coldly logical", "Berserker rage",
  "Honorable warrior", "Sadistic predator", "Melancholic rebel",
  "Fanatical zealot", "Cunning strategist", "Nihilistic destroyer",
  "Proud and arrogant", "Reluctant villain", "Chaotic anarchist",
];

const RIVALRIES = [
  "X (Mega Man X)", "Zero", "Axl", "Sigma", "Vile", "Iris",
  "Colonel", "Gate", "Lumine", "Dynamo", "Alia", "Layer",
];

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.045, duration: 0.3 },
  }),
};

interface Props {
  onGenerate: (data: MegamanXFormData) => void;
  onFormChange?: (data: MegamanXFormData) => void;
  onAddToQueue?: () => void;
  isLoading: boolean;
}

export default function MegamanXForm({ onGenerate, onFormChange, onAddToQueue, isLoading }: Props) {
  const [form, setForm] = useState<MegamanXFormData>({
    name: "",
    animalBase: "",
    element: "",
    armorColor: "",
    secondaryColor: "",
    chargedShot: "",
    dashType: "",
    armorUpgrade: "",
    personality: "",
    threatLevel: "high",
    rivalry: "",
  });
  const [isRandomizing, setIsRandomizing] = useState(false);

  const set = (key: keyof MegamanXFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const handleRandomize = useCallback(() => {
    setIsRandomizing(true);
    const randomData = randomizeMegamanX();
    setForm({ ...randomData, rivalry: randomData.rivalry ?? "" });
    setTimeout(() => setIsRandomizing(false), 600);
  }, []);

  const isValid =
    form.name &&
    form.animalBase &&
    form.element &&
    form.armorColor &&
    form.secondaryColor &&
    form.chargedShot &&
    form.dashType &&
    form.personality;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    onGenerate({ ...form, rivalry: form.rivalry || undefined });
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

  // X-series accent: electric cyan-green
  const accentColor = "oklch(0.72 0.22 185)";

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
            color: accentColor,
          }}
        >
          <motion.div
            animate={isRandomizing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Shuffle className="w-4 h-4" />
          </motion.div>
          <span>Randomize Maverick</span>
          <AnimatePresence>
            {isRandomizing && (
              <motion.span
                key="flash"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
                style={{ color: accentColor }}
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

      {/* Maverick Name */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Maverick Name <span className="text-destructive">*</span>
        </Label>
        <motion.input
          key={isRandomizing ? `name-${form.name}` : "name-static"}
          animate={isRandomizing ? { borderColor: accentColor, scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 0.3 }}
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Storm Eagle, Chill Penguin"
          maxLength={64}
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          style={inputStyle}
        />
      </motion.div>

      {/* Animal Base + Element */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Animal Base <span className="text-destructive">*</span>
          </Label>
          <Select value={form.animalBase} onValueChange={(v) => set("animalBase", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select animal" />
            </SelectTrigger>
            <SelectContent>
              {ANIMALS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Element <span className="text-destructive">*</span>
          </Label>
          <Select value={form.element} onValueChange={(v) => set("element", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select element" />
            </SelectTrigger>
            <SelectContent>
              {ELEMENTS.map((el) => (
                <SelectItem key={el} value={el}>{el}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Armor Colors */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Primary Color <span className="text-destructive">*</span>
          </Label>
          <Select value={form.armorColor} onValueChange={(v) => set("armorColor", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Primary color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
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
              {COLORS.filter((c) => c !== form.armorColor).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Charged Shot */}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Charged Shot / Special Weapon <span className="text-destructive">*</span>
        </Label>
        <Select value={form.chargedShot} onValueChange={(v) => set("chargedShot", v)}>
          <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
            <SelectValue placeholder="Select charged shot type" />
          </SelectTrigger>
          <SelectContent>
            {CHARGED_SHOTS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Dash Type */}
      <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Dash / Movement Ability <span className="text-destructive">*</span>
        </Label>
        <Select value={form.dashType} onValueChange={(v) => set("dashType", v)}>
          <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
            <SelectValue placeholder="Select dash type" />
          </SelectTrigger>
          <SelectContent>
            {DASH_TYPES.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Armor Upgrade */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Armor Upgrade <span className="text-xs opacity-60">(optional)</span>
        </Label>
        <Select value={form.armorUpgrade || "none"} onValueChange={(v) => set("armorUpgrade", v === "none" ? "" : v)}>
          <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
            <SelectValue placeholder="Select armor upgrade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {ARMOR_UPGRADES.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Personality + Threat Level */}
      <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Personality <span className="text-destructive">*</span>
          </Label>
          <Select value={form.personality} onValueChange={(v) => set("personality", v)}>
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue placeholder="Select personality" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Threat Level</Label>
          <Select
            value={form.threatLevel}
            onValueChange={(v) => set("threatLevel", v as MegamanXFormData["threatLevel"])}
          >
            <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="sigma-class">Sigma-Class (Extreme)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Rivalry */}
      <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="visible">
        <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">
          Rival / Nemesis <span className="text-xs opacity-60">(optional)</span>
        </Label>
        <Select value={form.rivalry || "none"} onValueChange={(v) => set("rivalry", v === "none" ? "" : v)}>
          <SelectTrigger className="rounded-xl" style={selectTriggerStyle}>
            <SelectValue placeholder="Select rival" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {RIVALRIES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Generate + Queue Buttons */}
      <motion.div custom={9} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2 flex gap-2">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="flex-1 h-12 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-40"
          style={{
            background:
              isValid && !isLoading
                ? "linear-gradient(135deg, oklch(0.72 0.22 185), oklch(0.60 0.22 220))"
                : undefined,
            boxShadow:
              isValid && !isLoading
                ? `0 4px 24px oklch(0.72 0.22 185 / 0.4)`
                : undefined,
          }}
        >
          <Zap className="w-4 h-4 mr-2" />
          {isLoading ? "Generating..." : "Generate"}
        </Button>
        {onAddToQueue && (
          <Button
            type="button"
            variant="outline"
            disabled={!isValid || isLoading}
            onClick={onAddToQueue}
            className="h-12 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40"
            style={{
              background: "oklch(0.14 0.015 260)",
              border: "1px solid oklch(0.28 0.03 260)",
              color: "oklch(0.72 0.22 185)",
            }}
            title="Add to queue"
          >
            + Queue
          </Button>
        )}
      </motion.div>
    </form>
  );
}
