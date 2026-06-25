# TransUA — Project Specification & Claude Instructions

## What is TransUA
A web app for booking bus rides and sending parcels on routes between **Ukraine ↔ Norway / Sweden**.
Target users: Ukrainian migrants in Scandinavia booking trips home or sending parcels to family.

### Supported languages
Ukrainian (`uk`), Norwegian (`no`), Swedish (`sv`), Polish (`pl`)

### Example routes
Kyiv → Oslo / Bergen / Stavanger, Lviv → Oslo / Stockholm, Odessa → Stockholm / Gothenburg

---

## Tech Stack

### Backend
| Technology | Version | Use |
|---|---|---|
| NestJS | 10 | Backend framework |
| TypeScript | 5 | Language |
| Prisma ORM | 5 | Database access |
| PostgreSQL | 16 | Main database (Docker) |
| Redis | 7 | Cache, seat locks, queues *(Phase 3+)* |
| Bull | 4 | Async job queues: SMS, email, PDF *(Phase 3+)* |
| pdfkit | 0.18 | PDF ticket generation *(built)* |
| Stripe | latest | Online payments *(deferred)* |
| Twilio | latest | SMS notifications *(Phase 3)* |
| SendGrid | latest | Email *(Phase 3)* |
| Socket.io | latest | WebSocket GPS tracking *(Phase 4)* |

### Frontend
| Technology | Version | Use |
|---|---|---|
| Next.js | 14 | App Router + SSR |
| TypeScript | 5 | Language |
| Tailwind CSS | 3 | Styles + custom fjord/sun/arctic palette |
| next-intl | 3 | i18n (uk/no/sv/pl) |
| React Hook Form | 7 | Forms |
| Zod | 3 | Validation |
| axios | 1 | HTTP client with JWT interceptor |
| Inter | Google Fonts | Typography |

### Infrastructure
| Service | Use | Cost/month |
|---|---|---|
| Railway | NestJS + PostgreSQL + Redis | ~$25 |
| Vercel | Next.js frontend | $0 |
| Cloudflare R2 | PDFs, delivery photos | ~$5 |
| Twilio | SMS (~200/month) | ~$2 |
| Stripe | 1.4% + 0.25€ per transaction | variable |

---

## Running the Project
```bash
docker compose up -d                              # start PostgreSQL
pnpm dev                                          # API on :3001 + Web on :3000
cd apps/api && npx ts-node prisma/seed.ts         # seed sample trips
cd apps/api && npx prisma studio                  # visual DB browser at :5555
```
**Windows notes:**
- Use PowerShell for kill: `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`
- PowerShell does NOT support `&&` — run commands separately
- `Jest worker` error = port conflict, kill Node and restart
- Prisma DLL locked → stop servers, delete `.dll.node` manually, then `prisma generate`

---

## Architecture Decisions
- JWT access token (15m) + refresh token (7d) stored in cookies via `js-cookie`
- Refresh tokens persisted in DB (`RefreshToken` table), deleted on logout
- All API responses: `{ data, error }` envelope; meta for pagination: `{ data, meta, error }`
- Global `HttpExceptionFilter` → `{ error: { code, message } }`
- Next.js `[locale]` routing — all pages under `app/[locale]/`
- Protected pages use route groups: `(dashboard)`, `(driver)`, `(admin)` with guard layouts
- i18n messages: `apps/web/src/messages/{uk,no,sv,pl}.json`
- Cash-only payments in current build; Stripe planned but deferred
- Navbar auth state re-checked on every route change via `usePathname()` dep in `useEffect`
- Booking pages redirect to login immediately on load if not authenticated
- Custom Tailwind palette: `fjord` (navy blues), `sun` (amber), `arctic` (light bg)
- UI uses inline styles with hex values for critical colors (avoids Tailwind JIT cold-start issues)

---

## Database Schema

### Current (built) models
```prisma
enum UserRole { PASSENGER, DRIVER, ADMIN }
enum TripStatus { SCHEDULED, BOARDING, IN_PROGRESS, COMPLETED, CANCELLED }
enum BookingStatus { CONFIRMED, CANCELLED }
enum PaymentMethod { CARD, BLIK, CASH }
enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }

model User {
  id, firstName, lastName, phone, email, passwordHash, role, preferredLang
  refreshTokens, bookings, vehicles, driverTrips, payments
}
model RefreshToken { id, userId, token, expiresAt }

model Route {
  id, originCountry, destinationCountry, originCity, destinationCity, durationHours, active
}
model Vehicle { id, driverId, plateNumber, model, capacity, active }

model Trip {
  id, fromCity, toCity, departureAt, arrivalAt, priceUah, totalSeats, status
  routeId? (optional FK), driverId?, vehicleId?
}
model Payment { id, payerId, amount, currency, method, status, providerTxId?, paidAt? }

model Booking {
  id, userId, tripId, seatNumber, passengerName, status
  pickupAddress?, dropoffAddress?, luggageKg?, paymentId?
  passengers BookingPassenger[]
  @@unique([tripId, seatNumber])
}
model BookingPassenger { id, bookingId, fullName, documentNumber?, phone? }
```

### Target schema (future phases)
```prisma
// Phase 3
enum ParcelStatus { PENDING_PICKUP, PICKED_UP, IN_TRANSIT, DELIVERED, RETURNED }
model ParcelOrder {
  id, senderId, tripId?, pickupAddress, deliveryAddress,
  recipientName, recipientPhone, weightKg, dimensions, description,
  status, trackingCode (unique, format: TUA-PKG-XXXXX), paymentId?
}
model ParcelStatusLog { id, parcelId, status, location?, note?, loggedAt }

// Phase 4
enum NotificationChannel { SMS, EMAIL, PUSH }
model Notification { id, userId, channel, subject, body, sent, sentAt }
```

---

## API Endpoints

### Format
```json
{ "data": { ... }, "meta": { "page": 1, "total": 42 }, "error": null }
{ "error": { "code": "BOOKING_NOT_FOUND", "message": "..." } }
```

### Auth `/api/auth`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | `/auth/register` | public | ✅ built |
| POST | `/auth/login` | public | ✅ built |
| POST | `/auth/refresh` | public | ✅ built |
| POST | `/auth/logout` | JWT | ✅ built |
| POST | `/auth/reset-password` | public | 🔲 Phase 4 |

### Users `/api/users`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/users/me` | JWT | ✅ built |
| PATCH | `/users/me` | JWT | ✅ built |
| DELETE | `/users/me` | JWT | 🔲 Phase 4 (GDPR) |
| GET | `/users` | admin | 🔲 Phase 4 |
| PATCH | `/users/:id/role` | admin | 🔲 Phase 4 |

### Routes `/api/routes`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/routes` | public | ✅ built |
| POST | `/routes` | admin | ✅ built |
| PATCH | `/routes/:id` | admin | 🔲 Phase 4 |

### Trips `/api/trips`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/trips?from&to&date&seats` | public | ✅ built |
| GET | `/trips/:id` | public | ✅ built (returns takenSeats[]) |
| POST | `/trips` | admin | 🔲 Phase 4 |
| PATCH | `/trips/:id/status` | driver | 🔲 Phase 4 |

### Bookings `/api/bookings`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | `/bookings` | JWT | ✅ built (cash, with passengers/pickup/dropoff/luggage) |
| GET | `/bookings/my` | JWT | ✅ built |
| GET | `/bookings/:id/ticket.pdf` | JWT | ✅ built |
| DELETE | `/bookings/:id` | JWT | ✅ built (cancel, no refund) |

### Parcels `/api/parcels`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | `/parcels/quote` | public | 🔲 Phase 3 |
| POST | `/parcels` | JWT | 🔲 Phase 3 |
| GET | `/parcels` | JWT | 🔲 Phase 3 |
| GET | `/parcels/:id` | JWT | 🔲 Phase 3 |
| GET | `/parcels/track/:code` | public | 🔲 Phase 3 |
| PATCH | `/parcels/:id/status` | driver | 🔲 Phase 3 |

### Payments `/api/payments`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| POST | `/payments/webhook` | public* | 🔲 deferred (Stripe) |
| GET | `/payments/:id` | JWT | 🔲 deferred |
| GET | `/payments` | admin | 🔲 Phase 4 |

### Vehicles & GPS `/api/vehicles`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/vehicles` | admin | 🔲 Phase 4 |
| POST | `/vehicles` | admin | 🔲 Phase 4 |
| PATCH | `/vehicles/:id/location` | driver | 🔲 Phase 4 |
| GET | `/vehicles/:id/location` | public | 🔲 Phase 4 |

### Admin `/api/admin`
| Method | Endpoint | Auth | Status |
|---|---|---|---|
| GET | `/admin/stats` | admin | 🔲 Phase 4 |
| PATCH | `/admin/users/:id/role` | admin | 🔲 Phase 4 |
| GET | `/admin/users` | admin | 🔲 Phase 4 |

### WebSocket — GPS (Phase 4)
| Event | Direction | Payload |
|---|---|---|
| `join-trip` | client → server | `{ tripId }` |
| `location-update` | driver → server | `{ tripId, lat, lng, timestamp }` |
| `trip-location` | server → passengers | `{ lat, lng, timestamp }` |
| `trip-status` | server → room | `{ status: TripStatus }` |

---

## Frontend Pages

### Built ✅
- `/[locale]` — Scandinavian hero with Sprinter van SVG, route cards, features strip, CTA
- `/[locale]/login` — login form
- `/[locale]/register` — register form
- `/[locale]/trips` — search form + results (auth check on Book button)
- `/[locale]/trips/[id]` — 4-step booking: Seat → Passengers → Payment → Confirm (auth redirect on load)
- `/[locale]/(dashboard)/dashboard` — profile with i18n labels + quick links to bookings/trips
- `/[locale]/(dashboard)/bookings` — my bookings + cancel + PDF download + empty CTA
- `/[locale]/parcels` — live price calculator + order form (auth-gated) + my parcels list

- `/[locale]/(driver)/driver` — driver's trip list + status management
- `/[locale]/(driver)/driver/trips/[id]` — passengers list + GPS broadcast button
- `/[locale]/(admin)/admin` — stats dashboard (users/trips/bookings/parcels/revenue)
- `/[locale]/(admin)/admin/users` — user list + role management
- `/[locale]/(admin)/admin/trips` — trip list + create + status management
- `/[locale]/(admin)/admin/parcels` — parcel overview
- `/[locale]/privacy` — privacy policy (GDPR)
- `/[locale]/terms` — terms of service

### Planned / Deferred
- `/[locale]/parcels/track/[code]` — public tracking, no login required *(deferred)*

---

## Roadmap

### Phase 1 ✅ Complete
- Register / Login / Logout with JWT
- Access token (15m) + refresh token (7d) with DB persistence
- User profile GET/PATCH
- 4-language UI (uk/no/sv/pl)
- Route protection (client + server)

### Phase 2 ✅ Complete
- Trip search (from/to/date/seats)
- Visual seat picker grid
- 4-step booking form: Seat + addresses → Passengers → Payment → Confirmation
- Multiple passengers per booking (up to 3) with document/phone
- Pickup/dropoff address + luggage weight on bookings
- Cash payment — creates Payment record (CASH/PENDING) in same Prisma transaction
- Cancel booking
- PDF ticket download (pdfkit, auth via Bearer token)
- Route model + Routes API (GET/POST)
- Vehicle model in schema
- BookingPassenger model
- Payment model
- Navbar auth state synced to route changes
- Auth redirect on booking page load (not just submit)
- Scandinavian UI design (fjord navy + amber palette, Inter font, Sprinter van SVG hero)
- Dashboard quick links + i18n field labels
- Bookings empty state CTA

**Still deferred (not blocking):**
- Stripe PaymentIntent + webhook
- Email confirmation via SendGrid
- 15-min Redis seat lock
- Refund logic

### Phase 3 ✅ Complete
- `ParcelOrder` + `ParcelStatusLog` DB models + Prisma migration
- Pricing calculator: base 15€ for 5kg, +2€/kg, +5€ for Sweden, max 50kg
- Tracking code format: `TUA-PKG-XXXXX` (auto-generated on order)
- Status flow: PENDING_PICKUP → PICKED_UP → IN_TRANSIT → DELIVERED / RETURNED
- Driver can update parcel status via `PATCH /parcels/:id/status`
- Parcels page: live price calculator + order form (auth-gated) + my parcels list
- i18n for all 4 languages (uk/no/sv/pl)

**Deferred from Phase 3:**
- Public tracking page `/parcels/track/[code]` (excluded by decision)
- SMS via Twilio on status changes (excluded by decision)

### Phase 4 ✅ Complete (partial)
- Driver dashboard + trip management (`/driver/trips`)
- Driver trip detail: passengers list + GPS broadcast via WebSocket
- GPS broadcasting via WebSocket (Socket.io gateway at `/gps`), Redis position storage (graceful fallback if Redis unavailable)
- Admin panel: stats dashboard, user management (role changes), trip management (create + status), parcel overview
- Vehicle management API (CRUD, driver/admin roles)
- `DELETE /users/me` — GDPR account deletion
- `helmet()` security headers on all routes
- `@nestjs/throttler` — global 30 req/min, stricter 5 req/min on `/auth/*`
- E2E tests (Playwright): navigation + booking flow in `e2e/booking-flow.spec.ts`
- SEO: `sitemap.ts` (all locale × static paths), `robots.ts`, JSON-LD (TravelAgency) in layout
- Privacy policy page `/[locale]/privacy`
- Terms of service page `/[locale]/terms`
- Cookie consent banner (localStorage, links to privacy policy)

**Still deferred:**
- Stripe payments
- SMS trip reminder (Bull scheduled job)
- Google OAuth

### Phase 5 — UX Polish 🔲 Not started
Identified via audit (2026-03-22). 107 issues across all pages.

#### Critical ✅ Done (2026-03-23)
- [x] Toast/notification system — `Toast.tsx` (ToastProvider + useToast hook), slide-in animation, auto-dismiss 4s, positioned above cookie banner
- [x] Loading states — `Spinner.tsx` component replaces all generic "Loading..." text on data pages
- [x] Error handling — all API calls now show user-facing error toasts; success actions (cancel booking, role save, status change, trip create) show success toasts

#### High ✅ Done (2026-03-23)
- [x] Confirmation dialogs — logout (Navbar), advance trip status (driver), role save (admin/users) use confirm()
- [x] Password show/hide toggle — both login and register, button inside input, label translated in all 4 langs
- [x] Admin tables pagination — `Pagination.tsx` component, PAGE_SIZE=20, applied to users/trips/parcels tables
- [x] Form validation messages — Zod schemas updated with readable English messages (Required, Max 50 chars, Invalid email, etc.)
- [x] Empty states — all admin tables show translated "no data" message in an empty colSpan row
- [x] Status indicators — icon (○◑●✓✕) added alongside color badge in trips (driver+admin) and parcels tables
- [x] Register ToS checkbox — linked to /terms page, Zod refine validation, stripped before API call
- [x] Admin hardcoded strings — all table headers now use t() i18n keys (name, email, phone, code, sender, recipient, weight, priceEur, date, arrival added to all 4 message files)

#### Medium ✅ Done (2026-03-23)
- [x] Accessibility — `aria-hidden` on nav SVG, `aria-label`+`aria-expanded` on hamburger, `aria-label`+`aria-pressed` on seat picker buttons, `focus:ring` on seat buttons
- [x] GPS/driver undo — mitigated by confirmation dialog added in High phase; full reverse-status requires backend change (deferred)
- [x] Cookie banner — "Decline" button added (GDPR-compliant); slide-up animation; full i18n in all 4 languages; mobile wraps properly
- [x] Parcels success state — enhanced with checkmark, prominent tracking code, new order button; loading state uses Spinner; error toast on load failure
- [x] Admin hardcoded strings — done in High phase
- [x] Date formatting — `intlLocale` map (uk-UA/nb-NO/sv-SE/pl-PL) applied to driver/page, admin/trips, admin/parcels
- [x] Seat picker mobile — changed to `grid-cols-4 sm:grid-cols-5`

#### Low / Polish ✅ Done (2026-03-23)
- [x] NProgress bar — `nextjs-toploader` installed, amber (#f59e0b) 3px bar, no spinner, added to root layout
- [x] GPS connecting state — `gpsConnecting` state; button turns grey with "⟳ Connecting..." while socket connects; `connect_error` shows error toast
- [x] PDF download loading state — `downloading` state per booking; button shows tc('loading') and is disabled while fetching; error toast on failure
- [x] Trip times timezone — added `timeZoneName: 'short'` to trips and booking pages; also fixed locale to use intlLocale map
- [x] Long city names truncation — `truncate max-w-[120px]` with `title` tooltip on from/to/driver cells in admin trips; `truncate max-w-xs` on driver dashboard cards

### Deferred (no timeline)
- Google OAuth (credentials not yet obtained)
- Stripe payments (currently cash-only, Stripe ready to add)
- React Native mobile app

---

## Business Rules

### Bookings
| Rule | Implementation |
|---|---|
| Seat uniqueness | `@@unique([tripId, seatNumber])` in Prisma |
| Cash payment | Creates Payment(CASH/PENDING) + Booking in one transaction |
| Cancel | Sets status CANCELLED, no refund in current build |
| Overbooking | Validate seat not taken before insert |
| Auth required | Booking page redirects to login on load if no `accessToken` cookie |

### Parcels Pricing
| Parameter | Value |
|---|---|
| Base price (UA → NO/SE) | 15€ for first 5 kg |
| Extra weight | +2€ per kg above 5 kg |
| Sweden surcharge | +5€ |
| Max weight | 50 kg (above → phone contact) |
| Delivery time | NO: 4 days, SE: 5 days |

---

## Environment Variables

### Backend `apps/api/.env`
```env
DATABASE_URL="postgresql://transua:transua@localhost:5432/transua"
JWT_ACCESS_SECRET="change-me-access-secret"   # ⚠️ change before deploying!
JWT_REFRESH_SECRET="change-me-refresh-secret" # ⚠️ change before deploying!
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Phase 3+
REDIS_URL="redis://localhost:6379"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL="noreply@transua.no"
SENDGRID_FROM_NAME="TransUA"

# Deferred
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_CURRENCY="eur"
BOOKING_REFUND_HOURS=48
CANCELLATION_FEE_PERCENT=50
```

### Frontend `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Deferred
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
NEXT_PUBLIC_GOOGLE_MAPS_KEY=""
```

> **Security note:** `NEXT_PUBLIC_*` variables are visible in the browser bundle — never put secrets there.
> Generate strong JWT secrets with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
