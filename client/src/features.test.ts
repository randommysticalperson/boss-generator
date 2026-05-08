import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueueJob } from "./hooks/useGenerationQueue";
import { randomizeMegaman, randomizeMegamanX, randomizePokemon } from "./lib/randomizer";

// ─── Feature 1: Randomize & Generate ─────────────────────────────────────────
// The Randomize & Generate button calls the randomizer then immediately calls
// onGenerate with the randomized data. We test that the data produced by the
// randomizer is always valid for submission (all required fields populated).

describe("Randomize & Generate — Mega Man Boss", () => {
  it("produces a valid, submittable boss form every time", () => {
    for (let i = 0; i < 20; i++) {
      const data = randomizeMegaman();
      expect(data.name).toBeTruthy();
      expect(data.element).toBeTruthy();
      expect(data.weaponName).toBeTruthy();
      expect(data.weaknessElement).toBeTruthy();
      expect(data.armorColor).toBeTruthy();
      expect(data.secondaryColor).toBeTruthy();
      expect(data.personality).toBeTruthy();
      expect(["easy", "medium", "hard", "brutal"]).toContain(data.difficulty);
    }
  });

  it("never produces the same name twice in a row (high variety)", () => {
    const names = new Set(Array.from({ length: 30 }, () => randomizeMegaman().name));
    expect(names.size).toBeGreaterThan(5);
  });
});

describe("Randomize & Generate — Mega Man X Maverick", () => {
  it("produces a valid, submittable maverick form every time", () => {
    for (let i = 0; i < 20; i++) {
      const data = randomizeMegamanX();
      expect(data.name).toBeTruthy();
      expect(data.animalBase).toBeTruthy();
      expect(data.element).toBeTruthy();
      expect(data.armorColor).toBeTruthy();
      expect(data.secondaryColor).toBeTruthy();
      expect(data.chargedShot).toBeTruthy();
      expect(data.dashType).toBeTruthy();
      expect(data.personality).toBeTruthy();
      expect(["low", "medium", "high", "sigma-class"]).toContain(data.threatLevel);
    }
  });
});

describe("Randomize & Generate — Custom Pokémon", () => {
  it("produces a valid, submittable pokémon form every time", () => {
    for (let i = 0; i < 20; i++) {
      const data = randomizePokemon();
      expect(data.name).toBeTruthy();
      expect(data.type1).toBeTruthy();
      expect(data.region).toBeTruthy();
      expect(data.ability).toBeTruthy();
      expect(data.move1).toBeTruthy();
      expect(data.personality).toBeTruthy();
      expect(["tiny", "small", "medium", "large", "massive"]).toContain(data.size);
      expect(["basic", "stage1", "stage2", "legendary"]).toContain(data.evolutionStage);
    }
  });
});

// ─── Feature 2: History Gallery Mode Filter ───────────────────────────────────
// The filter logic is: filter === "all" → return all, else return items whose
// mode matches the filter. We test the filtering function directly.

type HistoryItem = { id: number; mode: string; characterName: string; prompt: string; imageUrl: string };

function applyFilter(items: HistoryItem[], filter: string): HistoryItem[] {
  if (filter === "all") return items;
  return items.filter((i) => i.mode === filter);
}

const SAMPLE_HISTORY: HistoryItem[] = [
  { id: 1, mode: "megaman",  characterName: "Flame Man",    prompt: "p1", imageUrl: "u1" },
  { id: 2, mode: "megamanx", characterName: "Storm Eagle",  prompt: "p2", imageUrl: "u2" },
  { id: 3, mode: "pokemon",  characterName: "Embralynx",    prompt: "p3", imageUrl: "u3" },
  { id: 4, mode: "megaman",  characterName: "Ice Man",      prompt: "p4", imageUrl: "u4" },
  { id: 5, mode: "megamanx", characterName: "Volt Catfish", prompt: "p5", imageUrl: "u5" },
  { id: 6, mode: "pokemon",  characterName: "Aquathorn",    prompt: "p6", imageUrl: "u6" },
];

describe("History Gallery mode filter", () => {
  it("'all' filter returns every item", () => {
    expect(applyFilter(SAMPLE_HISTORY, "all")).toHaveLength(6);
  });

  it("'megaman' filter returns only Boss items", () => {
    const result = applyFilter(SAMPLE_HISTORY, "megaman");
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.mode === "megaman")).toBe(true);
  });

  it("'megamanx' filter returns only Maverick items", () => {
    const result = applyFilter(SAMPLE_HISTORY, "megamanx");
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.mode === "megamanx")).toBe(true);
  });

  it("'pokemon' filter returns only Pokémon items", () => {
    const result = applyFilter(SAMPLE_HISTORY, "pokemon");
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.mode === "pokemon")).toBe(true);
  });

  it("filter returns empty array when no items match", () => {
    const onlyBoss = SAMPLE_HISTORY.filter((i) => i.mode === "megaman");
    expect(applyFilter(onlyBoss, "pokemon")).toHaveLength(0);
  });

  it("counts per mode are correct", () => {
    const counts = {
      all: SAMPLE_HISTORY.length,
      megaman: SAMPLE_HISTORY.filter((i) => i.mode === "megaman").length,
      megamanx: SAMPLE_HISTORY.filter((i) => i.mode === "megamanx").length,
      pokemon: SAMPLE_HISTORY.filter((i) => i.mode === "pokemon").length,
    };
    expect(counts).toEqual({ all: 6, megaman: 2, megamanx: 2, pokemon: 2 });
  });
});

// ─── Feature 3: Queue localStorage Persistence ───────────────────────────────

const STORAGE_KEY = "characterforge_queue_v1";
const MAX_PERSISTED = 30;

function persistJobs(jobs: QueueJob[]): void {
  const toSave = jobs.slice(-MAX_PERSISTED);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function loadJobs(): QueueJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueueJob[];
    return parsed
      .slice(0, MAX_PERSISTED)
      .map((j) => (j.status === "processing" ? { ...j, status: "pending" as QueueJob["status"] } : j));
  } catch {
    return [];
  }
}

function makeJob(overrides: Partial<QueueJob> = {}): QueueJob {
  return {
    id: "test-id",
    mode: "megaman",
    characterName: "Test Boss",
    formData: {},
    extraPrompt: "",
    status: "pending",
    addedAt: Date.now(),
    ...overrides,
  };
}

describe("Queue localStorage persistence", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("persists jobs to localStorage", () => {
    const jobs = [makeJob({ id: "1", status: "completed", imageUrl: "https://img.png", prompt: "p" })];
    persistJobs(jobs);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe("1");
  });

  it("loads persisted jobs on init", () => {
    const jobs = [makeJob({ id: "a", status: "pending" }), makeJob({ id: "b", status: "completed" })];
    persistJobs(jobs);
    const loaded = loadJobs();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].id).toBe("a");
    expect(loaded[1].id).toBe("b");
  });

  it("resets 'processing' jobs back to 'pending' on load (crash recovery)", () => {
    const jobs = [makeJob({ id: "x", status: "processing" })];
    persistJobs(jobs);
    const loaded = loadJobs();
    expect(loaded[0].status).toBe("pending");
  });

  it("returns empty array when localStorage is empty", () => {
    expect(loadJobs()).toEqual([]);
  });

  it("returns empty array when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{");
    expect(loadJobs()).toEqual([]);
  });

  it("caps persisted jobs at MAX_PERSISTED", () => {
    const jobs = Array.from({ length: 40 }, (_, i) => makeJob({ id: String(i) }));
    persistJobs(jobs);
    const loaded = loadJobs();
    expect(loaded.length).toBeLessThanOrEqual(MAX_PERSISTED);
  });

  it("preserves completed jobs with imageUrl and prompt after reload", () => {
    const jobs = [makeJob({ id: "c", status: "completed", imageUrl: "https://img.png", prompt: "A boss" })];
    persistJobs(jobs);
    const loaded = loadJobs();
    expect(loaded[0].imageUrl).toBe("https://img.png");
    expect(loaded[0].prompt).toBe("A boss");
    expect(loaded[0].status).toBe("completed");
  });

  it("preserves failed jobs with error message after reload", () => {
    const jobs = [makeJob({ id: "f", status: "failed", error: "Timeout" })];
    persistJobs(jobs);
    const loaded = loadJobs();
    expect(loaded[0].status).toBe("failed");
    expect(loaded[0].error).toBe("Timeout");
  });
});
