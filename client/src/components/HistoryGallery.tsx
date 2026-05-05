import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Clock, ChevronDown, ChevronUp, X, Download } from "lucide-react";

export default function HistoryGallery() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const { data: history, isLoading } = trpc.generator.getHistory.useQuery({ limit: 20 });

  const handleDownload = async (imageUrl: string, name: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  if (!isLoading && (!history || history.length === 0)) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-6 rounded-full" style={{ background: "linear-gradient(180deg, oklch(0.75 0.18 50), oklch(0.70 0.20 160))" }} />
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Creation History
          </h3>
        </div>
        <div className="py-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float-animation"
            style={{ background: "oklch(0.18 0.02 260)", border: "1px solid oklch(0.28 0.03 260)" }}>
            <Clock className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold mb-1">No creations yet</p>
          <p className="text-muted-foreground text-sm">Your generated characters will appear here</p>
        </div>
      </div>
    );
  }

  const selectedItem = selected !== null ? history?.[selected] : null;

  return (
    <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 rounded-full" style={{ background: "linear-gradient(180deg, oklch(0.75 0.18 50), oklch(0.70 0.20 160))" }} />
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Creation History
          </h3>
          {history && history.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "oklch(0.75 0.18 50 / 0.15)",
                color: "oklch(0.85 0.18 50)",
                border: "1px solid oklch(0.75 0.18 50 / 0.3)",
              }}>
              {history.length} creation{history.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      <div className="shimmer aspect-square rounded-xl" />
                      <div className="mt-2 space-y-1.5">
                        <div className="shimmer h-4 rounded-lg w-3/4" />
                        <div className="shimmer h-3 rounded-lg w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {history?.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="group cursor-pointer"
                      onClick={() => setSelected(idx)}
                    >
                      <div
                        className="relative rounded-xl overflow-hidden aspect-square transition-all duration-300 group-hover:scale-105"
                        style={{ border: "1px solid oklch(0.22 0.02 260)" }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.characterName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                          style={{ background: "oklch(0.08 0.015 260 / 0.7)" }}>
                          <span className="text-white text-xs font-semibold">View</span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                            style={{
                              background: item.mode === "megaman"
                                ? "oklch(0.65 0.22 250 / 0.85)"
                                : "oklch(0.60 0.24 295 / 0.85)",
                              color: "white",
                            }}>
                            {item.mode === "megaman" ? "⚡" : "✨"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-foreground truncate">{item.characterName}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.prompt.slice(0, 60)}...</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0.08 0.015 260 / 0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="glass-card rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {selectedItem.characterName}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedItem.mode === "megaman" ? "⚡ Mega Man Boss" : "✨ Custom Pokémon"}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.characterName}
                className="w-full rounded-xl mb-4 object-contain"
                style={{ maxHeight: "320px", background: "oklch(0.12 0.015 260)" }}
              />

              <div className="rounded-xl p-3 mb-4" style={{ background: "oklch(0.12 0.015 260)", border: "1px solid oklch(0.22 0.02 260)" }}>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Generation Prompt</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{selectedItem.prompt}</p>
              </div>

              <button
                onClick={() => handleDownload(selectedItem.imageUrl, selectedItem.characterName)}
                className="w-full h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, oklch(0.70 0.20 160), oklch(0.65 0.18 130))",
                  boxShadow: "0 4px 16px oklch(0.70 0.20 160 / 0.3)",
                  color: "white",
                }}
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
