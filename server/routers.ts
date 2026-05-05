import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { saveGeneration, getGenerations, getGenerationsByUser } from "./db";
import { z } from "zod";

// ── Mega Man Boss form schema ──────────────────────────────────────────────────
const megamanFormSchema = z.object({
  name: z.string().min(1).max(64),
  element: z.string().min(1),
  weaponName: z.string().min(1),
  weaknessElement: z.string().min(1),
  armorColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  personality: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "brutal"]),
  specialAbility: z.string().optional(),
});

// ── Pokémon form schema ────────────────────────────────────────────────────────
const pokemonFormSchema = z.object({
  name: z.string().min(1).max(64),
  type1: z.string().min(1),
  type2: z.string().optional(),
  region: z.string().min(1),
  ability: z.string().min(1),
  move1: z.string().min(1),
  move2: z.string().optional(),
  personality: z.string().min(1),
  size: z.enum(["tiny", "small", "medium", "large", "massive"]),
  evolutionStage: z.enum(["basic", "stage1", "stage2", "legendary"]),
});

function buildMegamanPrompt(form: z.infer<typeof megamanFormSchema>, extraPrompt: string): string {
  const parts = [
    `A Mega Man Robot Master boss character named "${form.name}".`,
    `Element/theme: ${form.element}.`,
    `Wields the weapon "${form.weaponName}".`,
    `Armor is primarily ${form.armorColor} with ${form.secondaryColor} accents.`,
    `Personality: ${form.personality}.`,
    `Difficulty level: ${form.difficulty}.`,
    form.specialAbility ? `Special ability: ${form.specialAbility}.` : "",
    "Classic Mega Man NES/SNES art style, vibrant colors, robot humanoid design, helmet with visor, dynamic action pose.",
    "Clean pixel-art inspired illustration, bold outlines, dramatic lighting.",
    extraPrompt ? `Additional details: ${extraPrompt}` : "",
  ];
  return parts.filter(Boolean).join(" ");
}

function buildPokemonPrompt(form: z.infer<typeof pokemonFormSchema>, extraPrompt: string): string {
  const typeStr = form.type2 ? `${form.type1}/${form.type2}` : form.type1;
  const parts = [
    `A custom Pokémon named "${form.name}".`,
    `Type: ${typeStr}.`,
    `From the ${form.region} region.`,
    `Ability: ${form.ability}.`,
    `Signature moves: ${form.move1}${form.move2 ? ` and ${form.move2}` : ""}.`,
    `Personality: ${form.personality}.`,
    `Size: ${form.size}.`,
    `Evolution stage: ${form.evolutionStage}.`,
    "Official Pokémon art style, Ken Sugimori inspired illustration, clean white background, soft watercolor shading, expressive eyes, full-body view.",
    "High quality character design, vibrant colors, detailed features.",
    extraPrompt ? `Additional details: ${extraPrompt}` : "",
  ];
  return parts.filter(Boolean).join(" ");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  generator: router({
    generateMegaman: publicProcedure
      .input(z.object({
        form: megamanFormSchema,
        extraPrompt: z.string().max(500).default(""),
      }))
      .mutation(async ({ input, ctx }) => {
        const fullPrompt = buildMegamanPrompt(input.form, input.extraPrompt);
        const { url: imageUrlRaw } = await generateImage({ prompt: fullPrompt });
        if (!imageUrlRaw) throw new Error("Image generation failed");
        const imageUrl = imageUrlRaw;

        await saveGeneration({
          userId: ctx.user?.id,
          mode: "megaman",
          characterName: input.form.name,
          prompt: fullPrompt,
          imageUrl,
          formData: JSON.stringify(input.form),
        });

        return { imageUrl, prompt: fullPrompt, characterName: input.form.name };
      }),

    generatePokemon: publicProcedure
      .input(z.object({
        form: pokemonFormSchema,
        extraPrompt: z.string().max(500).default(""),
      }))
      .mutation(async ({ input, ctx }) => {
        const fullPrompt = buildPokemonPrompt(input.form, input.extraPrompt);
        const { url: imageUrlRaw } = await generateImage({ prompt: fullPrompt });
        if (!imageUrlRaw) throw new Error("Image generation failed");
        const imageUrl = imageUrlRaw;

        await saveGeneration({
          userId: ctx.user?.id,
          mode: "pokemon",
          characterName: input.form.name,
          prompt: fullPrompt,
          imageUrl,
          formData: JSON.stringify(input.form),
        });

        return { imageUrl, prompt: fullPrompt, characterName: input.form.name };
      }),

    getHistory: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user) {
          return getGenerationsByUser(ctx.user.id, input.limit);
        }
        return getGenerations(undefined, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
