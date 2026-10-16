# Updating dependencies

Dependencies are updated regularly, and an update that breaks something is rolled back package by package rather than holding everything back. The editor is the fragile part: BlockNote stays on 0.52.x (why: the BlockNote upgrade note in [`ROADMAP.md`](ROADMAP.md)), while the Tiptap and ProseMirror packages under it keep moving within their ranges, and BlockNote reaches into Tiptap's internals.

The **editor packages** are `@blocknote/*`, `@tiptap/*` and `prosemirror-*`.

## Steps

1. **Update on a branch.** Run `bun outdated`, then `bun update`. Plain `bun update` stays within the ranges in `package.json`, which keeps BlockNote on 0.52.x. Take a new major of any other package one at a time with `bun update <package> --latest`, so a break points at one package.

2. **Run the checks.** `bun run compile`, `bun run lint` and `bun run test` all pass. The editor tests in `src/components/editor/__tests__/` create a real BlockNote editor, so a broken editor usually fails here first.

3. **See whether the editor packages moved.** List what changed in the lockfile against the branch's base:

   ```bash
   git diff main -- bun.lock \
     | grep -oE '^[-+] +"(@blocknote/|@tiptap/|prosemirror-)[^"]*": \["[^"]+' \
     | sed -E 's/^([-+]).*\["/\1 /'
   ```

   No output: the editor is untouched, go to step 5. Otherwise confirm each core package is installed exactly once. A second copy of `prosemirror-model` is what once made Enter stop creating blocks; the `overrides` in `package.json` exist to prevent it:

   ```bash
   bun pm ls --all | grep -oE '(prosemirror-(model|view|state)|@tiptap/(core|pm))@[^ ]+' | sort -u
   ```

   One version per package is the pass.

4. **Hand the editor check to the user.** The user checks the UI themselves in `bun run dev`; give them the versions that moved and this list:

   - Typing, Enter and Backspace across paragraphs, headings and lists
   - The slash menu and the formatting toolbar
   - Tables: insert one, add a row and a column
   - Code blocks: Enter stays inside the block, the language picker works
   - Pasting text from a web page
   - Dragging a block by its side handle
   - An entry in the read-only view, in light and dark mode

   The step is done when the user reports the list passes, or names what broke (step 6).

5. **Commit `package.json` and `bun.lock` together** as `chore(deps): update dependencies`. When the editor packages moved, list them in the commit body (`@tiptap/*: 3.31.4 → 3.32.0`): that line is the record of which versions were checked and known good.

6. **Roll back only what broke.**
   - **Something outside the editor:** `bun update <package>@<last good version>`, or revert the update commit when the culprit is unclear.
   - **The editor:** hold the package at its last known-good version in `overrides`. Take the old version from the previous update commit's body or from `git log -p -- bun.lock`. Tiptap packages are released in lockstep and expect each other, so hold every installed `@tiptap/*` package at the same exact version:

     ```json
     "overrides": {
       "prosemirror-model": "^1.25.11",
       "prosemirror-view": "^1.42.3",
       "@tiptap/core": "3.31.4",
       "@tiptap/pm": "3.31.4",
       "@tiptap/react": "3.31.4"
     }
     ```

     List the full set with `ls node_modules/@tiptap`. Run `bun install`, then steps 2 to 4 again. Commit as `fix(deps): hold <package> at <version>` with what broke in the body, e.g. `3.33.0 breaks adding table rows`.

   On each later update, try removing a hold: drop it, run steps 2 to 4, and keep the hold only while the newer version still breaks.
