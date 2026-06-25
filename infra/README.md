Infra

Local DB for development is provided via docker-compose. Start with:

# Start Postgres (and Redis if enabled)
docker compose -f infra/docker-compose.yml up -d

Then set DATABASE_URL in apps/api/.env to match postgres connection.

Notes:
- The compose file uses environment variables POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB with sensible dev defaults (transua). These are safe for local development but must NOT be used in production.
- To override, create an .env file or export the variables before running docker compose:
  POSTGRES_USER=your_user POSTGRES_PASSWORD=your_password POSTGRES_DB=your_db docker compose -f infra/docker-compose.yml up -d
- Rotate and secure credentials for any shared or production services.
