import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, XCircle, Clock, Trash2, ChevronDown, ChevronUp, Zap, Circle, Sparkles } from "lucide-react";
import { useState } from "react";
import type { QueueJob } from "@/hooks/useGenerationQueue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QueuePanelProps {
  jobs: QueueJob[];
  isProcessing: boolean;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  onRemoveJob: (id: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onSelectCompleted: (job: QueueJob) => void;
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  megaman: <Zap className="w-3.5 h-3.5" />,
  megamanx: <Circle className="w-3.5 h-3.5" />,
  pokemon: <Sparkles className="w-3.5 h-3.5" />,
};

const MODE_LABELS: Record<string, string> = {
  megaman: "Boss",
  megamanx: "Maverick",
  pokemon: "Pokémon",
};

const MODE_COLORS: Record<string, string> = {
  megaman: "oklch(0.65 0.22 250)",
  megamanx: "oklch(0.72 0.22 185)",
  pokemon: "oklch(0.60 0.24 295)",
};

function StatusIcon({ status }: { status: QueueJob["status"] }) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case "processing":
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-400" />;
  }
}

function StatusBadge({ status }: { status: QueueJob["status"] }) {
  const config = {
    pending: { label: "Pending", className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    processing: { label: "Generating…", className: "bg-blue-500/15 text-blue-300 border-blue-500/30 animate-pulse" },
    completed: { label: "Done", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    failed: { label: "Failed", className: "bg-red-500/15 text-red-300 border-red-500/30" },
  }[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

function JobCard({
  job,
  index,
  onRemove,
  onSelect,
}: {
  job: QueueJob;
  index: number;
  onRemove: (id: string) => void;
  onSelect: (job: QueueJob) => void;
}) {
  const modeColor = MODE_COLORS[job.mode] ?? "oklch(0.65 0.22 250)";
  const isClickable = job.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.97 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`relative rounded-xl border p-3 flex items-center gap-3 group transition-all duration-200 ${
        isClickable ? "cursor-pointer hover:border-opacity-60" : ""
      } ${job.status === "processing" ? "border-blue-500/40 bg-blue-500/5" : "border-white/8 bg-white/3"}`}
      style={
        job.status === "processing"
          ? { boxShadow: `0 0 12px ${modeColor.replace(")", " / 0.15)")}` }
          : {}
      }
      onClick={isClickable ? () => onSelect(job) : undefined}
    >
      {/* Position number */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: `${modeColor.replace(")", " / 0.15)")}`, color: modeColor }}
      >
        {index + 1}
      </div>

      {/* Thumbnail for completed */}
      {job.status === "completed" && job.imageUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
          <img src={job.imageUrl} alt={job.characterName} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${modeColor.replace(")", " / 0.1)")}` }}
        >
          <StatusIcon status={job.status} />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-foreground truncate">{job.characterName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: modeColor }}
          >
            {MODE_ICONS[job.mode]}
            {MODE_LABELS[job.mode]}
          </span>
          <StatusBadge status={job.status} />
        </div>
        {job.status === "failed" && job.error && (
          <p className="text-xs text-red-400 mt-1 truncate">{job.error}</p>
        )}
      </div>

      {/* Remove button (only for pending/failed) */}
      {(job.status === "pending" || job.status === "failed") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(job.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground flex-shrink-0"
          title="Remove from queue"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Click hint for completed */}
      {isClickable && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground flex-shrink-0 pr-1">
          View →
        </div>
      )}
    </motion.div>
  );
}

export default function QueuePanel({
  jobs,
  isProcessing,
  pendingCount,
  completedCount,
  failedCount,
  onRemoveJob,
  onClearCompleted,
  onClearAll,
  onSelectCompleted,
}: QueuePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const totalJobs = jobs.length;

  if (totalJobs === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: "oklch(0.10 0.015 260 / 0.8)", backdropFilter: "blur(12px)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/8 cursor-pointer select-none"
        onClick={() => setIsCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isProcessing && (
              <motion.div
                className="w-2 h-2 rounded-full bg-blue-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Generation Queue
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {pendingCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                {pendingCount} pending
              </span>
            )}
            {isProcessing && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30 animate-pulse">
                1 generating
              </span>
            )}
            {completedCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {completedCount} done
              </span>
            )}
            {failedCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30">
                {failedCount} failed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(completedCount > 0 || failedCount > 0) && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClearCompleted();
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear done
            </Button>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Job list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    onRemove={onRemoveJob}
                    onSelect={onSelectCompleted}
                  />
                ))}
              </AnimatePresence>
            </div>
            {totalJobs > 1 && (
              <div className="px-3 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/15"
                  onClick={onClearAll}
                  disabled={isProcessing && pendingCount === 0}
                >
                  Clear all
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
