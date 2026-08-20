# Habit Atlas — Design Directions

## Three Candidate Directions

| Theme Name | Very Brief Intro | Probability |
|---|---|---:|
| Tactile Atlas | A richly printed personal field journal translated into software: energetic ink, colored indexing, and data marks that feel recorded rather than computed. It makes long-term consistency feel personal and archival. | 0.07 |
| Quiet Observatory | An airy celestial research instrument with disciplined grids, cool night tones, and sparse constellation-like data points. It frames habits as patterns observed over time. | 0.04 |
| Signal Garden | An optimistic organic system where habits grow as layered color fields, influenced by editorial botanical illustration and contemporary wayfinding. It makes progress feel alive without becoming game-like. | 0.08 |

## Chosen Direction — Tactile Atlas

### Design Movement

**Contemporary editorial data-journalism meets risograph field notes.** The interface is a personal atlas rather than a generic software dashboard: a serious record of daily effort with the warmth of a well-used printed object.

### Core Principles

1. **Make time tangible.** Calendar marks, heatmap cells, and dates are the primary visual texture; visual feedback always refers to a real date or action.
2. **Layer hierarchy, not containers.** Use ruled surfaces, intentional typography, inlaid side panels, and data bands instead of a wall of floating cards.
3. **Celebrate recovery as much as continuity.** Positive feedback is calm, specific, and never punitive; partial or missed states stay informative and humane.
4. **Reveal depth progressively.** The daily loop stays immediate, while analysis, schedules, notes, routines, and data tools appear in dedicated contextual views.

### Color Philosophy

The base is a warm paper tone that feels calm during daily use, offset with graphite typography for legibility. A saturated **Atlas Blue** carries active progress and trust, while vermilion, mineral green, and ochre distinguish habit categories with intention. The color system treats saturation as recorded energy—not decoration—so empty data has breathing room and completed activity reads instantly.

### Layout Paradigm

The desktop app is organized as a **fieldbook spread**: a fixed narrow navigation rail, a generous main daily page, and an optional contextual ledger at the right. Content is arranged as editorial columns and horizontal data bands rather than centered cards. On mobile, the spread folds into a focused single column with a compact bottom bar and a persistent one-tap action rhythm.

### Signature Elements

1. **Contribution quilt:** compact, slightly rounded data cells that create a living texture of consistency.
2. **Index tabs:** colored category and section markers that feel like physical dividers along the page edge.
3. **Ledger rules:** faint horizontal and vertical rules subtly align dates, statistics, and notes.

### Interaction Philosophy

High-frequency actions happen in place: one tap completes a binary habit and updates the connected progress and heatmap immediately. Expansion, editing, and measurement entry open deliberate sheets or inline controls. Every control carries explicit text or an accessible label; color never stands alone as the only status indicator.

### Animation

State updates use quick 140–220ms opacity and transform transitions with a decisive ease-out. When a habit is completed, its marker fills, the progress ring advances, and one heatmap cell settles into color—never bounces. Modal sheets enter from their relevant edge. All non-essential motion is disabled under reduced-motion preferences.

### Typography System

**DM Serif Display** is reserved for major page titles, dated moments, and occasional reflective copy. **Manrope** carries controls, statistics, labels, and body text for compact readability. Headings are substantial but not oversized; data labels use uppercase, tracked microtype; metric values use tabular figures when supported.

### Brand Essence

**Habit Atlas is a private, offline record of the routines that shape a life, for people who want visible progress without surveillance or pressure.**

Personality: **considered, grounded, quietly optimistic**.

### Brand Voice

Headlines are direct and observant; CTAs speak to a concrete action; microcopy uses calm, non-judgmental language.

> “Today has room for one good mark.”

> “Yesterday slipped. Your record is still yours.”

### Wordmark & Logo

The wordmark pairs a crisp serif “Habit” with a confident sans “Atlas.” The visual mark is an offset **A** built from four stacked contribution cells, with one intentionally open cell to represent continuity rather than perfection.

### Signature Brand Color

**Atlas Blue — #2F63F5.** A vivid, legible blue reserved for active progress, navigation, and the highest heatmap intensity.

## Style Decisions

- Use paper warmth and editorial data textures rather than generic SaaS gradients or glass cards.
- Keep the heatmap as a first-class interface object across dashboard, habits, analytics, and empty states.
- Use soft surface radii sparingly; information bands, rules, and typographic contrast do most of the structural work.
- Support a dark theme by translating the paper/ink relationship, not by introducing neon aesthetics.

### Visual Review Amendments

- Empty states remain usable-looking fieldbook pages: ruled record surfaces, dated placeholders, contribution-cell structures, and marginal notes appear before the first habit exists.
- Primary navigation behaves like a paper index with graphite ink, Atlas Blue tabs, and ledger rules; it avoids a dominant dark SaaS-style selection slab.
- Contribution cells are structural brand primitives that surface in record bands, empty states, dividers, and the logo—not just as ambient decoration.
