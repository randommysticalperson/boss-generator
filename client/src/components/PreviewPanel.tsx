import { motion } from "framer-motion";
import { Download, ImageIcon, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerationResult {
  imageUrl: string;
  prompt: string;
  characterName: string;
  mode: "megaman" | "pokemon";
}

interface Props {
  result: GenerationResult | null;
  isGenerating: boolean;
  mode: "megaman" | "pokemon";
}

export default function PreviewPanel({ result, isGenerating, mode }: Props) {
  const handleDownload = async () => {
    if (!result?.imageUrl) return;
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.characterName.replace(/\s+/g, "_")}_${mode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      window.open(result.imageUrl, "_blank");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-6 rounded-full"
          style={{ background: "linear-gradient(180deg, oklch(0.70 0.20 160), oklch(0.75 0.18 50))" }} />
        <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Character Preview
        </h3>
        {result && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: mode === "megaman"
                ? "oklch(0.65 0.22 250 / 0.15)"
                : "oklch(0.60 0.24 295 / 0.15)",
              color: mode === "megaman"
                ? "oklch(0.75 0.22 250)"
                : "oklch(0.70 0.24 295)",
              border: `1px solid ${mode === "megaman" ? "oklch(0.65 0.22 250 / 0.3)" : "oklch(0.60 0.24 295 / 0.3)"}`,
            }}>
            {mode === "megaman" ? "⚡ Boss" : "✨ Pokémon"}
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="flex-1 flex flex-col">
        <div
          className="relative rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            minHeight: "320px",
            background: "oklch(0.12 0.015 260)",
            border: "1px solid oklch(0.22 0.02 260)",
          }}
        >
          {result ? (
            <motion.img
              key={result.imageUrl}
              src={result.imageUrl}
              alt={result.characterName}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-contain"
              style={{ maxHeight: "400px" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center px-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center float-animation"
                style={{
                  background: "oklch(0.18 0.02 260)",
                  border: "1px solid oklch(0.28 0.03 260)",
                }}>
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-semibold mb-1">No character yet</p>
                <p className="text-muted-foreground text-sm">
                  Fill in the form and click Generate to create your{" "}
                  {mode === "megaman" ? "Mega Man boss" : "custom Pokémon"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wand2 className="w-3 h-3" />
                <span>AI generation takes 5–20 seconds</span>
              </div>
            </div>
          )}
        </div>

        {/* Character info */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 space-y-3"
          >
            <div>
              <h4 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {result.characterName}
              </h4>
            </div>
            <div className="rounded-xl p-3" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Generation Prompt</p>
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4">{result.prompt}</p>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full h-10 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, oklch(0.70 0.20 160), oklch(0.65 0.18 130))",
                boxShadow: "0 4px 16px oklch(0.70 0.20 160 / 0.3)",
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
