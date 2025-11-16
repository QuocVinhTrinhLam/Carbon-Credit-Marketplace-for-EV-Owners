# Carbon Credit Marketplace - Frontend

React + TypeScript frontend built with Vite, TailwindCSS, and ShadCN UI.

## Tech Stack

- **Vite 5** - Build tool & dev server
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **TailwindCSS 3** - Utility-first CSS
- **ShadCN UI** - Component library
- **TanStack Query** - Data fetching & caching
- **React Router v6** - Client-side routing
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client

## Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # ShadCN UI components
│   ├── common/          # Shared components (Navbar, Sidebar, etc.)
│   └── figma/           # Design system components
├── pages/               # Route pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Wallet.tsx
│   ├── Listings.tsx
│   ├── ListingDetail.tsx
│   ├── Credits.tsx
│   ├── Transactions.tsx
│   └── Profile.tsx
├── layouts/             # Layout wrappers
│   ├── AuthLayout.tsx
│   └── MainLayout.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   └── useFetch.ts
├── services/            # API client services
│   ├── api.ts           # Base axios instance
│   ├── auth.ts
│   ├── wallet.ts
│   ├── listing.ts
│   ├── credit.ts
│   └── transaction.ts
├── router/              # Route configuration
│   └── index.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## API Integration

All API calls go through the axios instance in `src/services/api.ts`, which:
- Sets `baseURL` to `/api`
- Automatically attaches JWT token from localStorage
- Proxies to backend at `http://localhost:8080` in development

## Environment

Development server runs on port **5173** and proxies `/api` requests to the Spring Boot backend.

No environment variables are needed for local development.

## Build Output

Production build outputs to `dist/` directory. Copy this to Spring Boot's `src/main/resources/static/` to serve the SPA from the backend.

