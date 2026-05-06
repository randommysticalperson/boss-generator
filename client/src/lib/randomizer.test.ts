import { describe, it, expect } from "vitest";
import { randomizeMegaman, randomizePokemon, randomizeMegamanX } from "./randomizer";

describe("randomizeMegaman", () => {
  it("returns all required fields", () => {
    const result = randomizeMegaman();
    expect(result.name).toBeTruthy();
    expect(result.element).toBeTruthy();
    expect(result.weaponName).toBeTruthy();
    expect(result.weaknessElement).toBeTruthy();
    expect(result.armorColor).toBeTruthy();
    expect(result.secondaryColor).toBeTruthy();
    expect(result.personality).toBeTruthy();
    expect(result.difficulty).toBeTruthy();
  });

  it("element and weakness are different", () => {
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 20; i++) {
      const result = randomizeMegaman();
      expect(result.element).not.toBe(result.weaknessElement);
    }
  });

  it("armorColor and secondaryColor are different", () => {
    for (let i = 0; i < 20; i++) {
      const result = randomizeMegaman();
      expect(result.armorColor).not.toBe(result.secondaryColor);
    }
  });

  it("difficulty is a valid value", () => {
    const validDifficulties = ["easy", "medium", "hard", "brutal"];
    for (let i = 0; i < 10; i++) {
      const result = randomizeMegaman();
      expect(validDifficulties).toContain(result.difficulty);
    }
  });

  it("name contains two words (prefix + suffix)", () => {
    for (let i = 0; i < 10; i++) {
      const result = randomizeMegaman();
      const words = result.name.trim().split(" ");
      expect(words.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("produces different results on repeated calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => randomizeMegaman().name));
    // With 30 prefixes and multiple suffixes, we should get variety
    expect(results.size).toBeGreaterThan(3);
  });
});

describe("randomizePokemon", () => {
  it("returns all required fields", () => {
    const result = randomizePokemon();
    expect(result.name).toBeTruthy();
    expect(result.type1).toBeTruthy();
    expect(result.region).toBeTruthy();
    expect(result.ability).toBeTruthy();
    expect(result.move1).toBeTruthy();
    expect(result.personality).toBeTruthy();
    expect(result.size).toBeTruthy();
    expect(result.evolutionStage).toBeTruthy();
  });

  it("type1 and type2 are different when both present", () => {
    for (let i = 0; i < 30; i++) {
      const result = randomizePokemon();
      if (result.type2) {
        expect(result.type1).not.toBe(result.type2);
      }
    }
  });

  it("size is a valid value", () => {
    const validSizes = ["tiny", "small", "medium", "large", "massive"];
    for (let i = 0; i < 10; i++) {
      const result = randomizePokemon();
      expect(validSizes).toContain(result.size);
    }
  });

  it("evolutionStage is a valid value", () => {
    const validStages = ["basic", "stage1", "stage2", "legendary"];
    for (let i = 0; i < 10; i++) {
      const result = randomizePokemon();
      expect(validStages).toContain(result.evolutionStage);
    }
  });

  it("name is a single compound word (no spaces)", () => {
    for (let i = 0; i < 10; i++) {
      const result = randomizePokemon();
      expect(result.name).not.toContain(" ");
    }
  });

  it("produces different results on repeated calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => randomizePokemon().name));
    expect(results.size).toBeGreaterThan(3);
  });

  it("sometimes generates type2 and sometimes does not", () => {
    const results = Array.from({ length: 40 }, () => randomizePokemon());
    const withType2 = results.filter((r) => r.type2 !== undefined);
    const withoutType2 = results.filter((r) => r.type2 === undefined);
    // With 45% chance of no type2, we should see both cases in 40 runs
    expect(withType2.length).toBeGreaterThan(0);
    expect(withoutType2.length).toBeGreaterThan(0);
  });
});

describe("randomizeMegamanX", () => {
  it("returns all required fields", () => {
    const result = randomizeMegamanX();
    expect(result.name).toBeTruthy();
    expect(result.animalBase).toBeTruthy();
    expect(result.element).toBeTruthy();
    expect(result.armorColor).toBeTruthy();
    expect(result.secondaryColor).toBeTruthy();
    expect(result.chargedShot).toBeTruthy();
    expect(result.dashType).toBeTruthy();
    expect(result.personality).toBeTruthy();
    expect(result.threatLevel).toBeTruthy();
  });

  it("armorColor and secondaryColor are different", () => {
    for (let i = 0; i < 20; i++) {
      const result = randomizeMegamanX();
      expect(result.armorColor).not.toBe(result.secondaryColor);
    }
  });

  it("threatLevel is a valid enum value", () => {
    const validLevels = ["low", "medium", "high", "sigma-class"];
    for (let i = 0; i < 10; i++) {
      const result = randomizeMegamanX();
      expect(validLevels).toContain(result.threatLevel);
    }
  });

  it("name contains two words (adjective + animal)", () => {
    for (let i = 0; i < 10; i++) {
      const result = randomizeMegamanX();
      const words = result.name.trim().split(" ");
      expect(words.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("produces different results on repeated calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => randomizeMegamanX().name));
    expect(results.size).toBeGreaterThan(3);
  });

  it("rivalry is sometimes set and sometimes undefined", () => {
    const results = Array.from({ length: 40 }, () => randomizeMegamanX());
    const withRivalry = results.filter((r) => r.rivalry !== undefined);
    const withoutRivalry = results.filter((r) => r.rivalry === undefined);
    expect(withRivalry.length).toBeGreaterThan(0);
    expect(withoutRivalry.length).toBeGreaterThan(0);
  });
});
