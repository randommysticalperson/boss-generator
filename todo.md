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

## Randomize Feature
- [x] Add randomize logic (random name generator + random field picker) for Mega Man Boss mode
- [x] Add randomize logic for Custom Pokémon mode
- [x] Add "Randomize" button with dice icon to both forms
- [x] Animate form fields when randomized (flash/highlight effect)
- [x] Update tests to cover randomize output validity

## Mega Man X Mode
- [x] Create MegamanXForm component with X-specific fields (Maverick name, animal base, element, armor upgrades, charged shot, dash type, personality, threat level, rivalry)
- [x] Add randomizer logic for Mega Man X mode in randomizer.ts
- [x] Add "Mega Man X" tab to the mode selector in Home.tsx
- [x] Update backend router to build X-series styled prompt for megamanx mode
- [x] Update DB schema/type to allow "megamanx" as a valid mode value
- [x] Wire MegamanXForm into Home page with correct generate handler
- [x] Write vitest tests for MegamanX randomizer (3 new tests, 23 total passing)
- [x] Save checkpoint

## Generation Queue Feature
- [x] Create useGenerationQueue hook with queue state (pending, processing, completed, failed)
- [x] Build QueuePanel UI component with job cards and status badges
- [x] Add "+ Queue" button alongside the Generate button in all three forms
- [x] Implement sequential queue processing (one job at a time)
- [x] Show active job's loading overlay and auto-display result in preview panel on completion
- [x] Allow removing pending jobs from the queue
- [x] Persist completed queue items linked to history gallery
- [x] Write vitest tests for queue hook logic (15 new tests, 44 total passing)
- [x] Save checkpoint

## Three New Features
- [x] Add "Randomize & Generate" one-click button to all three forms
- [x] Add mode filter tabs (All / Boss / Maverick / Pokémon) to history gallery
- [x] Persist queue state to localStorage so jobs survive page reloads
- [x] Write/update tests for new features (18 new tests, 62 total passing)
- [ ] Save checkpoint
