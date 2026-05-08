import { useState, useCallback, useRef, useEffect } from "react";
import { nanoid } from "nanoid";

const STORAGE_KEY = "characterforge_queue_v1";
const MAX_PERSISTED_JOBS = 30;

function loadPersistedJobs(): QueueJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueueJob[];
    // On reload: reset any in-flight jobs back to pending so they can be retried
    return parsed
      .slice(0, MAX_PERSISTED_JOBS)
      .map((j) => (j.status === "processing" ? { ...j, status: "pending" as QueueJobStatus } : j));
  } catch {
    return [];
  }
}

function persistJobs(jobs: QueueJob[]): void {
  try {
    // Only persist the most recent MAX_PERSISTED_JOBS to keep storage lean
    const toSave = jobs.slice(-MAX_PERSISTED_JOBS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Silently ignore quota errors
  }
}

export type QueueJobStatus = "pending" | "processing" | "completed" | "failed";

export type QueueJobMode = "megaman" | "megamanx" | "pokemon";

export interface QueueJob {
  id: string;
  mode: QueueJobMode;
  characterName: string;
  formData: Record<string, unknown>;
  extraPrompt: string;
  status: QueueJobStatus;
  imageUrl?: string;
  prompt?: string;
  error?: string;
  addedAt: number;
  completedAt?: number;
}

export interface GenerationQueueState {
  jobs: QueueJob[];
  isProcessing: boolean;
}

export interface UseGenerationQueueReturn {
  jobs: QueueJob[];
  isProcessing: boolean;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  addJob: (params: {
    mode: QueueJobMode;
    characterName: string;
    formData: Record<string, unknown>;
    extraPrompt: string;
  }) => string;
  removeJob: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  getJob: (id: string) => QueueJob | undefined;
  latestCompleted: QueueJob | null;
}

type GenerateFn = (job: QueueJob) => Promise<{ imageUrl: string; prompt: string; characterName: string }>;

export function useGenerationQueue(generateFn: GenerateFn): UseGenerationQueueReturn {
  const [jobs, setJobs] = useState<QueueJob[]>(() => loadPersistedJobs());
  const [isProcessing, setIsProcessing] = useState(false);

  // Persist jobs to localStorage whenever they change
  useEffect(() => {
    persistJobs(jobs);
  }, [jobs]);
  const processingRef = useRef(false);
  const generateFnRef = useRef(generateFn);

  // Keep generateFn ref up to date
  useEffect(() => {
    generateFnRef.current = generateFn;
  }, [generateFn]);

  const processNext = useCallback(async () => {
    if (processingRef.current) return;

    setJobs((prev) => {
      const nextPending = prev.find((j) => j.status === "pending");
      if (!nextPending) return prev;
      return prev.map((j) =>
        j.id === nextPending.id ? { ...j, status: "processing" as QueueJobStatus } : j
      );
    });

    // Read the updated jobs to find the processing one
    await new Promise<void>((resolve) => {
      setJobs((prev) => {
        const processingJob = prev.find((j) => j.status === "processing");
        if (!processingJob) {
          resolve();
          return prev;
        }

        processingRef.current = true;
        setIsProcessing(true);

        // Fire the async generation
        generateFnRef
          .current(processingJob)
          .then(({ imageUrl, prompt, characterName }) => {
            setJobs((current) =>
              current.map((j) =>
                j.id === processingJob.id
                  ? {
                      ...j,
                      status: "completed" as QueueJobStatus,
                      imageUrl,
                      prompt,
                      characterName,
                      completedAt: Date.now(),
                    }
                  : j
              )
            );
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Generation failed";
            setJobs((current) =>
              current.map((j) =>
                j.id === processingJob.id
                  ? { ...j, status: "failed" as QueueJobStatus, error: message, completedAt: Date.now() }
                  : j
              )
            );
          })
          .finally(() => {
            processingRef.current = false;
            setIsProcessing(false);
            resolve();
          });

        return prev;
      });
    });
  }, []);

  // Auto-process queue when jobs change
  useEffect(() => {
    const hasPending = jobs.some((j) => j.status === "pending");
    if (hasPending && !processingRef.current) {
      processNext();
    }
  }, [jobs, processNext]);

  const addJob = useCallback(
    (params: {
      mode: QueueJobMode;
      characterName: string;
      formData: Record<string, unknown>;
      extraPrompt: string;
    }): string => {
      const id = nanoid(8);
      const job: QueueJob = {
        id,
        ...params,
        status: "pending",
        addedAt: Date.now(),
      };
      setJobs((prev) => [...prev, job]);
      return id;
    },
    []
  );

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id || j.status === "processing"));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((j) => j.status !== "completed" && j.status !== "failed"));
  }, []);

  const clearAll = useCallback(() => {
    if (!processingRef.current) {
      setJobs([]);
    } else {
      setJobs((prev) => prev.filter((j) => j.status === "processing"));
    }
  }, []);

  const getJob = useCallback(
    (id: string) => jobs.find((j) => j.id === id),
    [jobs]
  );

  const latestCompleted =
    jobs
      .filter((j) => j.status === "completed")
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0] ?? null;

  return {
    jobs,
    isProcessing,
    pendingCount: jobs.filter((j) => j.status === "pending").length,
    completedCount: jobs.filter((j) => j.status === "completed").length,
    failedCount: jobs.filter((j) => j.status === "failed").length,
    addJob,
    removeJob,
    clearCompleted,
    clearAll,
    getJob,
    latestCompleted,
  };
}
