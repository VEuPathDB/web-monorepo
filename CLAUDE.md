# web-monorepo

## TypeScript, not JavaScript

The repo is gradually migrating off JavaScript; the `.jsx`/`.js` count should only go down.

- **New files are always `.tsx`/`.ts`** — never `.jsx`/`.js`, even alongside `.jsx` siblings.
- **Real types.** No `any`, no `@ts-ignore` to get past the compiler; use `unknown` plus
  narrowing when a type is genuinely unknowable.
- **Editing a `.jsx`? Consider converting it** (`git mv` to `.tsx`, add types). Do it when
  the file is small or you're already rewriting most of it. Skip it when the conversion
  would dwarf the change or drag in untyped imports — and say so in the PR.

Gentle pressure, not a mandate: a 400-line conversion buried in a bugfix is worse than
leaving the `.jsx` alone.
