# Boss & Pokémon Generator — TODO

## Phase 1: Project Setup
- [x] Initialize project scaffold
- [x] Create todo.md
- [x] Define database schema (generations table)
- [x] Generate and apply DB migration

## Phase 2: UI Layout & Forms
- [x] Global theme: dark elegant palette, custom fonts (Google Fonts), CSS variables
- [x] Top navigation bar with app title and mode selector tabs
- [x] Mega Man Boss customization form (name, element, weapon, weakness, armor color, personality, difficulty)
- [x] Custom Pokémon customization form (name, type1, type2, region, ability, move1, move2, personality, size)
- [x] Free-text prompt input field (shared across both modes)
- [x] Generate button with loading state animation

## Phase 3: AI Image Generation Backend
- [x] tRPC procedure: generateCharacter (builds prompt from form + free text, calls generateImage)
- [x] tRPC procedure: getHistory (fetch past generations from DB)
- [x] Save generation result (imageUrl, name, prompt, mode) to DB
- [x] Wire frontend mutation to backend procedure

## Phase 4: Preview Panel & History Gallery
- [x] Preview panel showing generated image with character name and prompt
- [x] Download button to save generated image
- [x] History gallery grid showing past creations (image, name, prompt)
- [x] Loading skeleton/animation during generation (5–20s wait)

## Phase 5: Polish & Tests
- [x] Responsive layout (mobile + desktop)
- [x] Smooth transitions and micro-interactions (framer-motion)
- [x] Empty states for gallery and preview
- [x] Error handling (generation failure toast)
- [x] Vitest tests for generateCharacter procedure
- [x] Final checkpoint
