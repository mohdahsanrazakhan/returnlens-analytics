# ReturnLens

Reduce returns. Rescue COD revenue. See what's costing you.

An analytics tool for Gulf e-commerce sellers to understand, analyze,
and reduce product returns and COD (Cash on Delivery) rejections
with AI-powered recommendations.

## Features
- Real-time loss calculator (returns + COD rejections), the dashboard's signature "Money Lost" hero
- Return analytics with reason breakdown, category, city, channel, and delivery-partner analysis
- COD analytics with city-wise success rates and order-value correlation
- Product-level return analysis with a category heatmap and risk scoring
- Customer risk scoring algorithm (0-100 scale) with a full profile drill-down
- AI-powered actionable recommendations with savings estimates (20 pre-seeded + on-demand generation)
- Gulf-specific: COD patterns, Arabic customer data, SAR/AED currencies
- Responsive dashboard (desktop + tablet + mobile)

## Tech Stack
- Next.js (App Router) + TypeScript (strict mode)
- Tailwind CSS + hand-rolled shadcn-style UI primitives
- MongoDB + Mongoose
- NextAuth.js v5 (JWT, Credentials provider)
- OpenAI API (GPT-4o-mini)
- Recharts

## Getting Started
1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env.local`, fill in the values (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`)
4. `npm run seed` (runs `scripts/seed.ts` — generates 65 products, 800 customers, 8,000 orders, 20 recommendations)
5. `npm run dev`
6. Open http://localhost:3000
7. Login: `demo@returnlens.com` / `ReturnLens@2026!`

## Seed Data Notes
The distributions (category return rates, city-level COD rejection rates, return
reasons, return timing, order-value COD pattern, channel/payment/geographic mix, and the
0-19/20-44/45-69/70-100 risk-band split) are all honored via weighted, deterministic sampling
in `src/seed/generators/`. One deliberate reconciliation: the spec's top-line "Order Status
Distribution" (12% COD Rejected of *all* orders) and its city-level COD rejection rule (6-18%
*of COD orders*, "THIS IS KEY DATA") are numerically incompatible given COD = 35% of orders,
the city-level rule is treated as authoritative since it drives the flagship COD Analytics page,
which lands cod_rejected at roughly 4-5% of all orders rather than a literal 12%.

## Security
- JWT auth with NextAuth.js v5, 24h session, CSRF protection on by default
- Every API route validates the session via `getAuthenticatedSession()` and inputs via Zod
- Rate limiting on login (5 attempts / 15 min / IP)
- Security headers (CSP, X-Frame-Options, etc.) applied in `middleware.ts`
- Server-side only OpenAI calls, capped at 1500 max_tokens, sanitized inputs
- No stack traces or internal details returned to the client, errors are logged server-side only

## License
MIT
