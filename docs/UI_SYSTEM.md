# SUTRA UI system

SUTRA is designed for micro and small-business operators who may use the app only a few minutes at a time and may not be comfortable with complex software.

## Design direction

- Mobile-first; desktop expands the same workflows rather than creating a separate desktop product.
- Large touch targets and short forms.
- One primary action per screen.
- Numbers are visually prominent; explanations stay secondary.
- Telugu-first copy support with English fallback.
- Deep indigo as the primary action color; restrained saffron/gold only for business emphasis.
- No decorative gradients or dense analytics walls.
- Every empty state explains what the user should do next.
- Loading and error states are designed, not browser defaults.

## External references used

The design direction is informed by the open-source shadcn/ui dashboard blocks and sidebar patterns, and by Lumen UI dashboard-shell and commerce-dashboard recipes.

References:
- https://ui.shadcn.com/blocks
- https://github.com/shadcn-ui/ui
- https://github.com/shadcndashboard/shadcndashboard

## SUTRA-specific rules

1. Bottom navigation on mobile; sidebar on larger screens.
2. Quick actions remain visible without scrolling on the dashboard.
3. Forms use progressive disclosure: required fields first, optional details later.
4. Transaction entry must show subtotal, discount, paid, and balance before confirmation.
5. Collection schedules must show the next due date and outstanding amount.
6. Inventory screens must distinguish quantity from value.
7. Reports must never fabricate values; zero means zero and unavailable means unavailable.
8. Destructive actions require explicit confirmation and should be rare.
9. Accessibility: semantic controls, visible focus, adequate contrast and touch size.
