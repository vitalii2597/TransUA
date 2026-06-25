Architecture overview

- Frontend: Next.js (apps/web) - SSR + client, Tailwind, next-intl for i18n
- Backend: NestJS (apps/api) - REST API, Prisma ORM, JWT auth
- Database: PostgreSQL (docker-compose in infra)
- Optional: Redis for caching, seat locks and queues
