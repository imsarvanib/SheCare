# SheCare Frontend

SheCare is a production-style frontend web application for integrated women health and wellness support.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (via @tailwindcss/vite)
- Framer Motion (animations and page transitions)
- Recharts (data visualizations)
- React Router (multi-page app routing)

## Core Modules

- Landing experience with soft gradient hero and horizontal feature rail
- Dashboard with cycle, medicine, and mood overview cards
- Period tracker with calendar, cycle logging, and chart insights
- Pregnancy care with weekly milestones and appointments
- Medicine reminder with add form and toggle schedules
- PCOS/PCOD tracker with symptom checklist and recommendations
- Mental health support with mood filters, stress and energy sliders, journaling, and quote carousel
- Healthcare schemes with search and age and eligibility filters
- Profile management with editable user form and settings toggles

## UX and Design System

- Light-only pink theme (no dark mode)
- Theme switch between blush and rose light variants
- Delta Dog handwritten style for headings and quote emphasis
- Poppins sans-serif for body and data-heavy interfaces
- Rounded surfaces, soft shadows, and subtle gradient depth
- Animated page transitions and staggered card reveals
- Horizontal scroll sections inspired by streaming-card UX
- Skeleton loading states for smooth content reveal

## Project Structure

- src/components
- src/pages
- src/layouts
- src/hooks
- src/utils
- src/data
- src/assets

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Notes

- All data is mock data for frontend-only development.
- Backend APIs and persistence are intentionally excluded and can be integrated later.
