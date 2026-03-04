# SubsMarket Design System & UI Guidelines 🎨

This document defines the core principles, styling rules, and component usage guidelines for the **SubsMarket 2.0** frontend application.

By strictly adhering to these rules, we ensure a consistent, maintainable, and visually appealing user interface across the entire app.

## 📱 Global Aesthetic: iOS Native Dark

The application uses a minimalist, dark-themed design inspired by native iOS interfaces.

- **Colors**: Deep black backgrounds (`bg-background`), subtly elevated elements (`bg-content1`, `bg-content2`), and vibrant accents (`primary`, `success`, `warning`).
- **Typography**: Clean, readable sans-serif fonts with distinct hierarchies. We heavily use uppercase, tracking-wide microcopy for Section Headers and Labels.
- **Interactions**: Smooth feedback via Telegram Haptics, soft shadows, and subtle scale animations.

---

## 🏗️ HeroUI Component Usage Rules

We use **HeroUI** as our foundational component library. **DO NOT** fight the framework by applying excessive custom Tailwind classes that override HeroUI's default behaviors.

### 1. Cards (`<Card>`)

Cards are the primary structural element for grouping content.
- **DO**: Use standard props like `shadow="sm"`, `isPressable`, and `radius`.
- **DO**: Use `<CardBody>` for consistent internal padding.
- **DON'T**: Apply custom background classes like `bg-content1` unless strictly overriding a specific modifier. HeroUI handles backgrounds automatically based on the active theme.
- **DON'T**: Add custom borders like `border-1 border-default-100` unless explicitly creating an outlined variant (in which case, consider HeroUI's built-in variants).
- **DON'T**: Map custom hover states (e.g., `hover:bg-default-50`). Rely on `isPressable` to handle native press/hover aesthetics natively.

```tsx
// ✅ GOOD: Clean, relying on HeroUI defaults
<Card shadow="sm" isPressable onPress={handleAction}>
    <CardBody>Content</CardBody>
</Card>

// ❌ BAD: Redundant custom styling
<Card className="bg-content1 shadow-sm border border-default-100 hover:bg-default-50 transition-colors w-full">
...
```

### 2. Navigation Elements (`<Navbar>`)

For sticky headers, top bars, and sub-navigation.
- **DO**: Use `<Navbar>` for sticky page headers. It handles blurring (`isBlurred`) and positioning natively.
- **DO**: Use `<NavbarContent>` and `<NavbarItem>` to structure the header layout grid.
- **DON'T**: Build custom sticky `div` headers with `backdrop-blur` utilities.

```tsx
// ✅ GOOD: Standard Navbar
<Navbar isBordered isBlurred className="px-0">
    <NavbarContent justify="start">...</NavbarContent>
    <NavbarContent justify="center">...</NavbarContent>
</Navbar>

// ❌ BAD: Custom sticky div
<div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b ...">...</div>
```

### 3. Filter Buttons & Tags (`<Chip>`)

Use Chips for categorization, filtering, and status labels.
- **DO**: Use `<Chip>` components for horizontal scrolling filters instead of custom-styled buttons.
- **DO**: Use variants (`solid`, `flat`, `faded`) and semantic colors (`primary`, `success`, `warning`, `danger`) to indicate state.
- **DON'T**: Build custom rounded filter buttons with custom padding and font weights.

### 4. Buttons (`<Button>`)

* **DO**: Utilize HeroUI variants (`solid`, `flat`, `light`, `ghost`) and colors.
- **DO**: Use the `isLoading` and `isDisabled` props built into the component instead of custom conditional logic or transparency classes.
- **DO**: Ensure full-width main action buttons (e.g. at the bottom of the screen) use `fullWidth`, `size="lg"`, and rounded corners (e.g. `radius="2xl"` or `radius="full"`).

### 5. Mobile / Telegram WebApp Specifics

* **Bottom Safe Area**: Always account for iOS bottom safe areas using `env(safe-area-inset-bottom)`.
- **Haptic Feedback**: Always trigger `useHaptic().selection()` for tab/filter changes and `impact('light' | 'medium' | 'heavy')` for meaningful actions (submitting, navigating).
- **Fixed Action Bars**: Keep bottom action buttons fixed above the bottom navigation or safe area, fading out the content below them using a small gradient mask if necessary to prevent visual clipping.

---

## 🖋 Summary

1. **HeroUI First**: Check the [HeroUI Documentation](https://heroui.com/) before building a feature manually.
2. **Minimal Custom CSS**: If you are writing more than 3 layout/spacing Tailwind utility classes on a HeroUI component, you are likely doing it wrong.
3. **Consistency is Key**: Maintain the "iOS Dark" feel by leveraging default shadows, radii, and semantic colors.
