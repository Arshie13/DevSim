FROM postgres:16-alpine

# Save original Postgres entrypoint
RUN cp /usr/local/bin/docker-entrypoint.sh /usr/local/bin/postgres-entrypoint.sh

# Install Node.js and pnpm
# openssl + libstdc++ are required by Prisma's query/schema engine on Alpine (musl).
# Without openssl, Prisma fails to detect libssl, falls back to the openssl-1.1.x
# engine, and crashes with "Could not parse schema engine response" at migrate/seed.
RUN apk add --no-cache nodejs pnpm bash openssl libstdc++

# Copy our custom entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use our custom entrypoint that extends the official one
ENTRYPOINT ["/entrypoint.sh"]
