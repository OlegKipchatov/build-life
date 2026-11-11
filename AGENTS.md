# BuildLife project rules

## Mobile input typography

- All mobile input controls must use a computed font size of **16px**, never smaller. This includes input, textarea, select, editable text, and custom select/multiselect triggers in every page, modal, and bottom sheet.
- Apply this rule to narrow viewports and touch devices, including landscape orientation.
- Keep the central mobile-input-typography rule in docs/index.html. Do not override it with smaller component styles or use transforms to shrink editable text.
- Preserve pinch zoom. Do not add user-scalable=no or maximum-scale=1 to work around focus zoom.
- When adding or changing a form, verify its mobile input font size remains 16px.

## JavaScript

- Use arrow functions.
