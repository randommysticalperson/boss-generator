import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock image generation and db
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/test-image.png" }),
}));

vi.mock("./db", () => ({
  saveGeneration: vi.fn().mockResolvedValue({}),
  getGenerations: vi.fn().mockResolvedValue([]),
  getGenerationsByUser: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("generator.generateMegaman", () => {
  it("returns imageUrl, prompt, and characterName on success", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.generator.generateMegaman({
      form: {
        name: "Flame Titan Man",
        element: "Fire",
        weaponName: "Inferno Blade",
        weaknessElement: "Ice",
        armorColor: "Red",
        secondaryColor: "Gold",
        personality: "Aggressive",
        difficulty: "hard",
        specialAbility: "Fire wall",
      },
      extraPrompt: "dramatic lava background",
    });

    expect(result.characterName).toBe("Flame Titan Man");
    expect(result.imageUrl).toBe("https://example.com/test-image.png");
    expect(result.prompt).toContain("Flame Titan Man");
    expect(result.prompt).toContain("Fire");
    expect(result.prompt).toContain("Inferno Blade");
  });

  it("includes element, weapon, and colors in the generated prompt", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.generator.generateMegaman({
      form: {
        name: "Crystal Shard Man",
        element: "Crystal",
        weaponName: "Crystal Cannon",
        weaknessElement: "Metal",
        armorColor: "Cyan",
        secondaryColor: "Silver",
        personality: "Stoic",
        difficulty: "medium",
      },
      extraPrompt: "",
    });

    expect(result.prompt).toContain("Crystal");
    expect(result.prompt).toContain("Crystal Cannon");
    expect(result.prompt).toContain("Cyan");
    expect(result.prompt).toContain("Silver");
  });
});

describe("generator.generatePokemon", () => {
  it("returns imageUrl, prompt, and characterName on success", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.generator.generatePokemon({
      form: {
        name: "Embralynx",
        type1: "Fire",
        type2: "Psychic",
        region: "Alola",
        ability: "Solar Flare",
        move1: "Ember Surge",
        move2: "Mind Blast",
        personality: "Bold",
        size: "medium",
        evolutionStage: "stage2",
      },
      extraPrompt: "bioluminescent markings",
    });

    expect(result.characterName).toBe("Embralynx");
    expect(result.imageUrl).toBe("https://example.com/test-image.png");
    expect(result.prompt).toContain("Embralynx");
    expect(result.prompt).toContain("Fire/Psychic");
    expect(result.prompt).toContain("Solar Flare");
  });

  it("handles single-type Pokémon correctly", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.generator.generatePokemon({
      form: {
        name: "Stoneback",
        type1: "Rock",
        region: "Johto",
        ability: "Iron Shell",
        move1: "Rock Slide",
        personality: "Stoic",
        size: "large",
        evolutionStage: "basic",
      },
      extraPrompt: "",
    });

    expect(result.prompt).toContain("Rock");
    expect(result.prompt).not.toContain("Rock/");
    expect(result.prompt).toContain("Stoneback");
  });
});

describe("generator.getHistory", () => {
  it("returns empty array for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.generator.getHistory({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("calls getGenerationsByUser when user is authenticated", async () => {
    const { getGenerationsByUser } = await import("./db");
    const caller = appRouter.createCaller(createUserCtx());
    await caller.generator.getHistory({ limit: 5 });
    expect(getGenerationsByUser).toHaveBeenCalledWith(42, 5);
  });
});
