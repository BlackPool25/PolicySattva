---
name: Organic Intellectual
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#747878'
  outline-variant: '#c4c7c8'
  surface-tint: '#5d5f5f'
  primary: '#5d5f5f'
  on-primary: '#ffffff'
  primary-container: '#ffffff'
  on-primary-container: '#747676'
  inverse-primary: '#c6c6c7'
  secondary: '#4e6700'
  on-secondary: '#ffffff'
  secondary-container: '#bdf126'
  on-secondary-container: '#516b00'
  tertiary: '#6a5c51'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffffff'
  on-tertiary-container: '#827367'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#c0f42a'
  secondary-fixed-dim: '#a6d700'
  on-secondary-fixed: '#151f00'
  on-secondary-fixed-variant: '#3a4d00'
  tertiary-fixed: '#f2dfd1'
  tertiary-fixed-dim: '#d5c3b6'
  on-tertiary-fixed: '#231a11'
  on-tertiary-fixed-variant: '#51443a'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system balances the rigorous structure of editorial publishing with a vibrant, organic energy. It targets an audience that values deep reading, academic clarity, and modern sustainability. The emotional response should be one of "refreshed focus"—combining the stillness of a library with the vitality of a botanical garden.

The style is a hybrid of **Minimalism** and **High-Contrast Editorial**. It utilizes expansive white space to denote premium quality, using sharp typography and unexpected lime accents to break the traditional "academic" mold. The interface feels light, breathable, and intellectually stimulating.

## Colors

The palette is rooted in a "Paper and Moss" philosophy.
- **Primary (White):** Used for all surfaces and backgrounds to maximize clarity and light.
- **Secondary (Lime Green):** A high-energy, organic accent used sparingly for highlights, primary actions, and "new" indicators. It represents growth and modern vitality.
- **Tertiary (Sophisticated Brown):** A deep, warm espresso-toned brown used for primary text, structural borders, and heavy iconography. It replaces traditional black to provide a softer, more premium contrast.
- **Neutral:** A subtle, bone-colored off-white used for secondary containers or grouped background elements to provide depth without breaking the white-label feel.

## Typography

The typography strategy employs a "Serif-Modernist" pairing. **Literata** provides the editorial authority for headlines, utilizing its bookish roots to ground the design in sophistication. **Hanken Grotesk** is used for body copy and UI labels, offering a sharp, contemporary counterpoint that ensures high legibility and a tech-forward feel. 

Large headlines should use negative letter-spacing to appear "tight" like a printed broadsheet. Labels are frequently uppercased with generous tracking to act as clear navigational signposts.

## Layout & Spacing

The design system utilizes a **Fixed Grid** on desktop (12 columns, 1200px max-width) to mimic the structured columns of a luxury magazine. On mobile, it shifts to a 4-column fluid layout.

Spacing is intentionally generous ("Oversized White Space"). Elements are grouped using a strict 8px base unit. Section headers should be separated by the `xl` (80px) token to allow the brand to breathe. Content blocks are separated by `lg` (48px) units, while internal component elements use `sm` or `md` units.

## Elevation & Depth

This system avoids traditional shadows to maintain a flat, editorial aesthetic. Depth is achieved through **Low-contrast Outlines** and **Tonal Layers**.

- **Level 0 (Background):** Pure White.
- **Level 1 (Surface):** Neutral (Off-white) backgrounds for sidebars or secondary content sections.
- **Level 2 (Interaction):** Elements use a 1px solid border in a very light tint of the Tertiary Brown (approx 10% opacity) rather than shadows.
- **Level 3 (Pop-overs):** Modals and dropdowns use a sharp, 2px solid Tertiary Brown border with no blur, creating a "stacked paper" effect.

## Shapes

The shape language is **Soft**. A subtle 0.25rem (4px) radius is applied to cards, buttons, and input fields. This avoids the harshness of a pure brutalist grid while remaining disciplined enough for a scholarly aesthetic. 

The Lime Green accents can occasionally use **Pill-shaped** geometry for small "tags" or "chips" to create a visual distinction between structural elements (Soft) and interactive/status elements (Pill).

## Components

- **Buttons:** Primary buttons are filled Lime Green with Tertiary Brown text. Secondary buttons are outlined in Tertiary Brown with no fill. Both use `label-md` for text.
- **Input Fields:** Bottom-border only or very light 1px outlines in Tertiary Brown. Focus state switches the border to Lime Green with a 2px thickness.
- **Cards:** White background with a subtle 1px frame. No shadow. The header of the card should use the `headline-md` serif font.
- **Chips:** Small, pill-shaped tags. High-interest tags use the Lime Green background. Meta-data tags use the Neutral background with Tertiary Brown text.
- **Lists:** Separated by thin, horizontal rules in 10% Tertiary Brown. List items use `body-md` with a slightly increased line height (1.6) for readability.
- **Accents:** Use vertical Lime Green lines (2px width) to the left of blockquotes or highlighted paragraphs to draw the eye.