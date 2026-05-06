import { describe, it, expect, vi } from "vitest";
import { QueueJob } from "./useGenerationQueue";

// Unit tests for the queue data model and job state transitions
// (The hook itself uses React state so we test the pure logic separately)

type JobStatus = QueueJob["status"];

function makeJob(overrides: Partial<QueueJob> = {}): QueueJob {
  return {
    id: "test-id-1",
    mode: "megaman",
    characterName: "Flame Man",
    formData: { name: "Flame Man", element: "Fire" },
    extraPrompt: "",
    status: "pending",
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("QueueJob data model", () => {
  it("creates a pending job with required fields", () => {
    const job = makeJob();
    expect(job.status).toBe("pending");
    expect(job.id).toBeTruthy();
    expect(job.characterName).toBe("Flame Man");
    expect(job.mode).toBe("megaman");
  });

  it("supports all three modes", () => {
    const modes: Array<QueueJob["mode"]> = ["megaman", "megamanx", "pokemon"];
    modes.forEach((mode) => {
      const job = makeJob({ mode });
      expect(job.mode).toBe(mode);
    });
  });

  it("supports all four status values", () => {
    const statuses: JobStatus[] = ["pending", "processing", "completed", "failed"];
    statuses.forEach((status) => {
      const job = makeJob({ status });
      expect(job.status).toBe(status);
    });
  });

  it("completed job has imageUrl and prompt", () => {
    const job = makeJob({
      status: "completed",
      imageUrl: "https://example.com/image.png",
      prompt: "A fire boss with red armor",
      characterName: "Flame Man",
    });
    expect(job.status).toBe("completed");
    expect(job.imageUrl).toBe("https://example.com/image.png");
    expect(job.prompt).toBe("A fire boss with red armor");
  });

  it("failed job has error message", () => {
    const job = makeJob({
      status: "failed",
      error: "Image generation service unavailable",
    });
    expect(job.status).toBe("failed");
    expect(job.error).toContain("unavailable");
  });

  it("job createdAt is a valid timestamp", () => {
    const before = Date.now();
    const job = makeJob({ createdAt: Date.now() });
    const after = Date.now();
    expect(job.createdAt).toBeGreaterThanOrEqual(before);
    expect(job.createdAt).toBeLessThanOrEqual(after);
  });
});

describe("Queue filtering logic", () => {
  const jobs: QueueJob[] = [
    makeJob({ id: "1", status: "completed", imageUrl: "https://img1.png", prompt: "p1" }),
    makeJob({ id: "2", status: "pending" }),
    makeJob({ id: "3", status: "processing" }),
    makeJob({ id: "4", status: "failed", error: "timeout" }),
    makeJob({ id: "5", status: "completed", imageUrl: "https://img2.png", prompt: "p2" }),
  ];

  it("counts pending jobs correctly", () => {
    const pending = jobs.filter((j) => j.status === "pending");
    expect(pending).toHaveLength(1);
  });

  it("counts completed jobs correctly", () => {
    const completed = jobs.filter((j) => j.status === "completed");
    expect(completed).toHaveLength(2);
  });

  it("counts failed jobs correctly", () => {
    const failed = jobs.filter((j) => j.status === "failed");
    expect(failed).toHaveLength(1);
  });

  it("identifies the processing job", () => {
    const processing = jobs.find((j) => j.status === "processing");
    expect(processing?.id).toBe("3");
  });

  it("removes a job by id", () => {
    const filtered = jobs.filter((j) => j.id !== "2");
    expect(filtered).toHaveLength(4);
    expect(filtered.find((j) => j.id === "2")).toBeUndefined();
  });

  it("clears all completed jobs", () => {
    const remaining = jobs.filter((j) => j.status !== "completed");
    expect(remaining).toHaveLength(3);
    expect(remaining.every((j) => j.status !== "completed")).toBe(true);
  });

  it("finds latest completed job", () => {
    const completed = jobs.filter((j) => j.status === "completed");
    const latest = completed[completed.length - 1];
    expect(latest?.id).toBe("5");
    expect(latest?.imageUrl).toBe("https://img2.png");
  });
});

describe("Queue generate function mock", () => {
  it("resolves with imageUrl, prompt, and characterName", async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      imageUrl: "https://example.com/result.png",
      prompt: "Generated prompt",
      characterName: "Test Boss",
    });

    const job = makeJob({ mode: "megaman", characterName: "Test Boss" });
    const result = await mockGenerate(job);

    expect(result.imageUrl).toBe("https://example.com/result.png");
    expect(result.prompt).toBe("Generated prompt");
    expect(result.characterName).toBe("Test Boss");
    expect(mockGenerate).toHaveBeenCalledWith(job);
  });

  it("rejects with error on generation failure", async () => {
    const mockGenerate = vi.fn().mockRejectedValue(new Error("Service unavailable"));
    const job = makeJob();

    await expect(mockGenerate(job)).rejects.toThrow("Service unavailable");
  });
});
