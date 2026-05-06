import type { MegamanFormData } from "@/components/MegamanForm";
import type { PokemonFormData } from "@/components/PokemonForm";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo<T>(arr: T[]): [T, T] {
  const first = pick(arr);
  const rest = arr.filter((x) => x !== first);
  return [first, pick(rest)];
}

// ── Mega Man name parts ────────────────────────────────────────────────────────
const MM_PREFIXES = [
  "Blaze", "Frost", "Thunder", "Quake", "Venom", "Plasma", "Shadow", "Crystal",
  "Magma", "Gale", "Tidal", "Gravity", "Acid", "Prism", "Volt", "Toxic",
  "Inferno", "Cryo", "Surge", "Void", "Solar", "Lunar", "Steel", "Neon",
  "Hyper", "Dark", "Storm", "Blade", "Omega", "Titan",
];

const MM_SUFFIXES = [
  "Man", "Man", "Man", "Man", "Man", // weighted toward "Man" for authenticity
  "Knight", "Striker", "Crusher", "Blaster", "Slasher",
];

const MM_ELEMENTS = [
  "Fire", "Ice", "Electric", "Water", "Wind", "Earth", "Shadow", "Light",
  "Metal", "Wood", "Gravity", "Time", "Magnet", "Bubble", "Crystal", "Acid",
];

const MM_PERSONALITIES = [
  "Aggressive", "Cunning", "Stoic", "Berserker", "Tactical",
  "Arrogant", "Honorable", "Chaotic", "Calm", "Ruthless",
];

const MM_COLORS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Cyan", "Gold",
  "Silver", "Black", "White", "Pink", "Teal", "Crimson", "Indigo",
];

const MM_WEAPONS = [
  "Cannon", "Blade", "Beam", "Cutter", "Buster", "Lance", "Hammer",
  "Shield", "Boomerang", "Drill", "Missile", "Tornado", "Laser", "Bomb",
  "Trident", "Whip", "Scythe", "Fist", "Arrow", "Spike",
];

const MM_ABILITIES = [
  "Phase through walls", "Summon minions", "Create force fields",
  "Teleport short distances", "Reflect projectiles", "Split into clones",
  "Absorb energy attacks", "Freeze time briefly", "Become invisible",
  "Charge a devastating beam", "Spin like a top", "Burrow underground",
  "Fly at high speed", "Emit shockwaves", "Drain health on contact",
  "Detach limbs as weapons", "Overload nearby electronics", "Grow in size",
];

const MM_DIFFICULTIES = ["easy", "medium", "hard", "brutal"] as const;

export function randomizeMegaman(): MegamanFormData {
  const prefix = pick(MM_PREFIXES);
  const suffix = pick(MM_SUFFIXES);
  const element = pick(MM_ELEMENTS);
  const weakness = pick(MM_ELEMENTS.filter((e) => e !== element));
  const [armorColor, secondaryColor] = pickTwo(MM_COLORS);
  const weaponAdjective = pick(MM_PREFIXES);
  const weaponNoun = pick(MM_WEAPONS);

  return {
    name: `${prefix} ${suffix}`,
    element,
    weaponName: `${weaponAdjective} ${weaponNoun}`,
    weaknessElement: weakness,
    armorColor,
    secondaryColor,
    personality: pick(MM_PERSONALITIES),
    difficulty: pick([...MM_DIFFICULTIES]),
    specialAbility: Math.random() > 0.3 ? pick(MM_ABILITIES) : "",
  };
}

// ── Pokémon name parts ─────────────────────────────────────────────────────────
const PKM_PREFIXES = [
  "Ember", "Cryo", "Volt", "Aqua", "Terra", "Aero", "Umbra", "Lumi",
  "Ferro", "Flora", "Psycho", "Specter", "Draco", "Venom", "Fae",
  "Magna", "Cosmo", "Geo", "Hydro", "Pyro", "Nox", "Sol", "Arcano",
  "Crysta", "Tempest", "Rune", "Myst", "Echo", "Prism", "Nexus",
];

const PKM_SUFFIXES = [
  "lynx", "vore", "claw", "fang", "wing", "back", "maw", "paw",
  "tail", "fin", "horn", "spike", "shell", "scale", "orb",
  "eon", "ite", "ix", "ax", "us", "on", "ara", "ula",
];

const PKM_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
  "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
  "Dragon", "Dark", "Steel", "Fairy",
];

const PKM_REGIONS = [
  "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos",
  "Alola", "Galar", "Paldea", "Ancient", "Cosmic", "Volcanic",
  "Deep Sea", "Tundra", "Jungle",
];

const PKM_ABILITIES = [
  "Solar Flare", "Void Shroud", "Prism Scale", "Iron Shell",
  "Frost Aura", "Thunder Veil", "Shadow Meld", "Lunar Pulse",
  "Tidal Force", "Crystal Guard", "Ember Coat", "Storm Surge",
  "Gravity Well", "Arcane Shield", "Phantom Step", "Magma Core",
  "Blizzard Skin", "Static Field", "Toxic Bloom", "Dragon Scales",
];

const PKM_MOVE_VERBS = [
  "Surge", "Blast", "Beam", "Strike", "Slash", "Pulse", "Wave",
  "Burst", "Rush", "Crash", "Smash", "Flare", "Bolt", "Gust",
];

const PKM_MOVE_NOUNS = [
  "Ember", "Frost", "Thunder", "Aqua", "Terra", "Shadow", "Prism",
  "Crystal", "Void", "Solar", "Lunar", "Storm", "Magma", "Arcane",
];

const PKM_PERSONALITIES = [
  "Timid", "Bold", "Jolly", "Serious", "Gentle", "Fierce",
  "Playful", "Mysterious", "Noble", "Wild", "Ancient", "Mischievous",
];

const PKM_SIZES = ["tiny", "small", "medium", "large", "massive"] as const;
const PKM_EVO_STAGES = ["basic", "stage1", "stage2", "legendary"] as const;

export function randomizePokemon(): PokemonFormData {
  const prefix = pick(PKM_PREFIXES);
  const suffix = pick(PKM_SUFFIXES);
  const type1 = pick(PKM_TYPES);
  const hasType2 = Math.random() > 0.45;
  const type2 = hasType2 ? pick(PKM_TYPES.filter((t) => t !== type1)) : undefined;
  const hasMove2 = Math.random() > 0.35;
  const move1Verb = pick(PKM_MOVE_VERBS);
  const move1Noun = pick(PKM_MOVE_NOUNS);
  const move2Verb = pick(PKM_MOVE_VERBS.filter((v) => v !== move1Verb));
  const move2Noun = pick(PKM_MOVE_NOUNS.filter((n) => n !== move1Noun));

  return {
    name: `${prefix}${suffix}`,
    type1,
    type2,
    region: pick(PKM_REGIONS),
    ability: pick(PKM_ABILITIES),
    move1: `${move1Noun} ${move1Verb}`,
    move2: hasMove2 ? `${move2Noun} ${move2Verb}` : undefined,
    personality: pick(PKM_PERSONALITIES),
    size: pick([...PKM_SIZES]),
    evolutionStage: pick([...PKM_EVO_STAGES]),
  };
}

// ── Mega Man X name parts ──────────────────────────────────────────────────────
import type { MegamanXFormData } from "@/components/MegamanXForm";

const MMX_ADJECTIVES = [
  "Storm", "Chill", "Flame", "Spark", "Gravity", "Sting", "Launch", "Armored",
  "Boomer", "Wheel", "Bubble", "Crush", "Neon", "Volt", "Blaze", "Crystal",
  "Toxic", "Slash", "Magna", "Tunnel", "Frost", "Cyber", "Dark", "Hyper",
  "Acid", "Prism", "Shadow", "Omega", "Vile", "Sigma",
];

const MMX_ANIMALS = [
  "Eagle", "Penguin", "Mammoth", "Chameleon", "Armadillo", "Hornet",
  "Octopus", "Shark", "Falcon", "Rhino", "Crab", "Moth", "Beetle",
  "Mantis", "Scorpion", "Bat", "Panther", "Cobra", "Wolf", "Tiger",
  "Alligator", "Stingray", "Gorilla", "Crow", "Dragonfly", "Squid",
];

const MMX_ELEMENTS = [
  "Fire", "Ice", "Electric", "Wind", "Earth", "Water", "Shadow", "Light",
  "Gravity", "Crystal", "Magma", "Plasma", "Acid", "Void", "Cyber", "Toxic",
];

const MMX_COLORS = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Cyan", "Gold",
  "Silver", "Black", "White", "Pink", "Teal", "Crimson", "Indigo", "Violet",
];

const MMX_CHARGED_SHOTS = [
  "Homing missiles", "Spread fire burst", "Charged plasma beam",
  "Ice crystal shards", "Thunder wave ring", "Gravity well orb",
  "Flame pillar strike", "Void energy lance", "Acid rain volley",
  "Crystal spike barrage", "Wind blade cyclone", "Shadow clone shot",
  "Magma eruption blast", "Cyber virus bolt", "Toxic cloud bomb",
  "Sonic boom slash", "Laser ricochet", "Seismic ground pound",
];

const MMX_DASH_TYPES = [
  "Air dash (horizontal)", "Air dash (any direction)", "Double air dash",
  "Ground dash only", "Teleport dash", "Drill dash through walls",
  "Flame trail dash", "Ice freeze dash", "Gravity flip dash",
  "Shadow step dash", "Hyper speed burst", "Charge-cancel dash",
];

const MMX_ARMOR_UPGRADES = [
  "Fourth Armor (Ultimate)", "Giga Armor", "Shadow Armor", "Falcon Armor",
  "Blade Armor", "Neutral Armor", "Glitch Armor", "Dark Armor",
  "Stealth Armor", "Siege Armor", "Prism Armor", "None (unarmored)",
];

const MMX_PERSONALITIES = [
  "Loyal-turned-Maverick", "Coldly logical", "Berserker rage",
  "Honorable warrior", "Sadistic predator", "Melancholic rebel",
  "Fanatical zealot", "Cunning strategist", "Nihilistic destroyer",
  "Proud and arrogant", "Reluctant villain", "Chaotic anarchist",
];

const MMX_RIVALRIES = [
  "X (Mega Man X)", "Zero", "Axl", "Sigma", "Vile", "Iris",
  "Colonel", "Gate", "Lumine", "Dynamo", "Alia", "Layer",
];

const MMX_THREAT_LEVELS = ["low", "medium", "high", "sigma-class"] as const;

export function randomizeMegamanX(): MegamanXFormData {
  const adjective = pick(MMX_ADJECTIVES);
  const animal = pick(MMX_ANIMALS);
  const [armorColor, secondaryColor] = pickTwo(MMX_COLORS);
  const hasArmor = Math.random() > 0.4;
  const hasRivalry = Math.random() > 0.4;

  return {
    name: `${adjective} ${animal}`,
    animalBase: pick(MMX_ANIMALS),
    element: pick(MMX_ELEMENTS),
    armorColor,
    secondaryColor,
    chargedShot: pick(MMX_CHARGED_SHOTS),
    dashType: pick(MMX_DASH_TYPES),
    armorUpgrade: hasArmor ? pick(MMX_ARMOR_UPGRADES.filter((a) => a !== "None (unarmored)")) : "",
    personality: pick(MMX_PERSONALITIES),
    threatLevel: pick([...MMX_THREAT_LEVELS]),
    rivalry: hasRivalry ? pick(MMX_RIVALRIES) : undefined,
  };
}
