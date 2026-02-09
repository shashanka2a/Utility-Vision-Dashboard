# Utility Vision Dashboard Design

This is a **Next.js** (App Router) codebase for Utility Vision Dashboard Design. The original project is available at [Figma](https://www.figma.com/design/urF3pjuDRVWSvyNkbFiw4d/Utility-Vision-Dashboard-Design).

## Prerequisites

- **Node.js 18+**
- Familiarity with React and basic Next.js (App Router) concepts

## Setup & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/activity` by default.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |

## Tech stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **next/font** (Inter)
- Radix UI, Recharts, Sonner, next-themes, react-day-picker

## Project structure

- `app/` – Next.js App Router: `layout.tsx`, `page.tsx`, `globals.css`, and route segments
- `app/(dashboard)/` – Dashboard layout (sidebar) and routes: `/activity`, `/reports`, `/daily-logs`, `/projects`, `/directory`, `/company`
- `src/components/` – Shared React components and UI primitives

## SEO & branding

- `<title>` and `<meta>` are set in `app/layout.tsx`.
- Add `app/icon.ico` (or `public/favicon.ico`) and `app/opengraph-image.png` for favicon and social preview.
