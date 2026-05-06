import { motion } from "framer-motion";

type Mode = "megaman" | "megamanx" | "pokemon";

interface Props {
  mode: Mode;
}

const megamanMessages = [
  "Calibrating robot master circuits...",
  "Forging battle armor...",
  "Loading weapon systems...",
  "Initializing boss AI...",
  "Charging special weapon...",
];

const megamanXMessages = [
  "Activating Maverick protocols...",
  "Fusing animal DNA with reploid tech...",
  "Charging X-Buster to maximum...",
  "Uploading combat algorithms...",
  "Initializing Maverick Hunter threat...",
  "Calibrating dash systems...",
];

const pokemonMessages = [
  "Consulting the Pokédex...",
  "Weaving elemental energy...",
  "Shaping creature design...",
  "Applying type markings...",
  "Awakening hidden ability...",
];

const MODE_CONFIG: Record<Mode, {
  messages: string[];
  primaryColor: string;
  secondaryColor: string;
  icon: string;
  label: string;
}> = {
  megaman: {
    messages: megamanMessages,
    primaryColor: "oklch(0.65 0.22 250)",
    secondaryColor: "oklch(0.55 0.22 220)",
    icon: "⚡",
    label: "Creating Boss...",
  },
  megamanx: {
    messages: megamanXMessages,
    primaryColor: "oklch(0.72 0.22 185)",
    secondaryColor: "oklch(0.60 0.22 220)",
    icon: "🔵",
    label: "Creating Maverick...",
  },
  pokemon: {
    messages: pokemonMessages,
    primaryColor: "oklch(0.60 0.24 295)",
    secondaryColor: "oklch(0.70 0.20 160)",
    icon: "✨",
    label: "Creating Pokémon...",
  },
};

export default function LoadingOverlay({ mode }: Props) {
  const cfg = MODE_CONFIG[mode];
  const randomMessage = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];
  const { primaryColor, secondaryColor } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "oklch(0.08 0.015 260 / 0.85)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
        className="glass-card rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 shadow-2xl"
        style={{ border: `1px solid ${primaryColor.replace(")", " / 0.3)")}` }}
      >
        {/* Animated rings */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                width: `${48 + i * 24}px`,
                height: `${48 + i * 24}px`,
                borderColor: primaryColor,
                opacity: 0.6 - i * 0.15,
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6 - i * 0.15, 0.2, 0.6 - i * 0.15] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          {/* Center icon */}
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl z-10"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 0 24px ${primaryColor.replace(")", " / 0.5)")}`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {cfg.icon}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.18 0.02 260)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="text-foreground font-bold text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {cfg.label}
          </p>
          <motion.p
            key={randomMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm"
          >
            {randomMessage}
          </motion.p>
          <p className="text-muted-foreground/60 text-xs mt-2">This may take 5–20 seconds</p>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? primaryColor : secondaryColor,
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.3,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
