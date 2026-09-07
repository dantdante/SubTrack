# SubTrack

a minimal, dark-themed subscription tracker &amp; cancellation manager. built with a #151515 base, white buttons/accents, and smoooooth animations to help you see what you’re paying for and cancel in seconds.

## screens

- **dashboard** — subscription cards with cost, cycle and next billing date, plus a floating "+ add subscription" button
- **add subscription** — name, cost, billing cycle, next billing date, notes
- **detail** — service name, cost, billing details, "cancel subscription" (primary) and "edit" (secondary)

## running

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

State is in-memory only; there is no backend yet.
