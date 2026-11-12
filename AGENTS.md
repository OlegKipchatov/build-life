# BuildLife project rules

## Mobile input typography

- All mobile input controls must use a computed font size of **16px**, never smaller. This includes input, textarea, select, editable text, and custom select/multiselect triggers in every page, modal, and bottom sheet.
- Apply this rule to narrow viewports and touch devices, including landscape orientation.
- Keep the central mobile-input-typography rule in src/App.module.css. Do not override it with smaller component styles or use transforms to shrink editable text.
- Preserve pinch zoom. Do not add user-scalable=no or maximum-scale=1 to work around focus zoom.
- When adding or changing a form, verify its mobile input font size remains 16px.

## JavaScript

- Use arrow functions.

## Architecture and checkpoints

- React + TypeScript, TanStack Router (hash history), HeroUI. Use CSS Modules for application styling; Tailwind is only HeroUI style build infrastructure.
- Keep buildlife-v1 persistence and XP rules backward compatible. Tasks are centralized; milestone progress depends only on steps.
- Mobile controls, including custom select triggers, must remain 16px.
- Commit and push logical checkpoints to the active migration PR; do not leave completed work only in the temporary workspace. Do not merge without user instruction.
- Run npm test and npm run build before publication.
