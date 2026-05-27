# KLYVO - Real Estate Platform

Welcome to the KLYVO project repository. KLYVO is a data-driven real estate ecosystem designed for ultra-fast performance, minimal aesthetics, and geospatial data precision.

## 🚀 Sprint 2: Authentication & Agent Flow Complete

1.  **Neon Serverless Postgres**: Migrated database from Supabase to Neon, adapting PostGIS constraints and building native backend APIs.
2.  **Express API & JWT**: Constructed \`server.ts\` running standard Express.js with JSON Web Token (JWT) + Bcrypt Auth.
3.  **UI Implementation**: 
    - Full-Screen Neo-Unicorn Login/Register Modals.
    - Property Upload Dashboard with drag-and-drop Cloudflare R2 placeholder logic.
4.  **Zustand Auth Storage**: Session state management via \`src/store/useAuthStore.ts\`.

## 🚀 Sprint 3: Geospatial Discovery (The Map) Complete

1.  **Zillow-style Split View**: Introduced `DiscoveryView` as the main layout, showing a search sidebar and a high-performance interactive map.
2.  **Leaflet & Marker Clustering**: Implemented `react-leaflet` with `react-leaflet-cluster` for parsing large geospatial node sets efficiently.
3.  **Neon PostGIS Radius Search**: Hooked up the `search_properties_in_radius` SQL function to a shiny new `/api/properties` node endpoint using ST_DWithin constraints.
4.  **React Query Integration**: Wired server-state synchronization with TanStack react-query, passing search bounding limits (`lat`, `lng`, `radius`) optimally.

## 🚀 Sprint 4: Property Detail & Klyvo Score Complete

1. **Dynamic Klyvo Score**: Integrated advanced SQL logic to calculate price per square meter live averages per neighborhood, scoring properties as _Underpriced_, _Overpriced_, or _Fair Value_.
2. **Mortgage Calculator**: Implemented an interactive mortgage component matching the Neo-Unicorn aesthetic, dynamically tied to the property's listing price.
3. **Optimized Property View**: Created a responsive full-width property detail component displaying geospatial data, image galleries, and listing parameters.
4. **Agent WhatsApp Bridge**: Implemented dynamic deep-linking to initiate instant contact with the listing agent via WhatsApp with prepopulated criteria.

## 🚀 Sprint 5: Optimization & Deployment Complete

1. **Progressive Web App (PWA)**: Implemented `manifest.json` and meta themeing for mobile installation.
2. **Sharp Image Pipeline**: Integrated `multer` and `sharp` in Express for on-the-fly server-side image processing, reducing uploaded images into highly optimized WebP thumbnails and medium formats.
3. **Multi-Environment Deployments**: Added `vercel.json` (serverless node strategy) and `wrangler.toml` (Cloudflare Workers) configuration files ensuring the Express backend routes correctly to serverless functions.

## 📂 Project Structure

```text
/
├── neon/
│   └── migrations/                  # Neon Postgres SQL schemas and RPCs (PostGIS)
├── src/
│   ├── components/
│   │   ├── auth/                    # Modals and auth logic
│   │   ├── properties/              # Drag-and-drop R2 uploader forms
│   ├── store/                       # Zustand global state (Auth Token)
│   ├── types/                       # Global TypeScript interfaces
│   ├── App.tsx                      # Dashboard + Agent View
│   └── index.css                    # Neo-Unicorn Tailwind v4 config
├── server.ts                        # Full-stack API (Auth, S3 presigning)
├── .env.example                     # Keys for Neon & Cloudflare R2
└── package.json                     # build pipeline config
```

## 🛠️ Setup Instructions

1.  **Environment Variables**: Create a \`.env\` file based on \`.env.example\` with your Neon Postgres DB URL.
2.  **Database Setup**: 
    * Execute \`neon/migrations/00001_initial_schema.sql\` on your Neon SQL Editor to initialize tables and PostGIS.
3.  **Run Development**: 
    * \`npm run dev\` starts both Vite (React) and the Express Backend simultaneously.

---

_Waiting for confirmation to proceed to **Sprint 3: Geospatial Discovery (The Map)**._
