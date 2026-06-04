FROM postgres:16-alpine

# Save original Postgres entrypoint
RUN cp /usr/local/bin/docker-entrypoint.sh /usr/local/bin/postgres-entrypoint.sh

# Install Node.js, pnpm, bash and dos2unix
RUN apk add --no-cache nodejs pnpm bash dos2unix

# Copy our custom entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Use our custom entrypoint that extends the official one
ENTRYPOINT ["/entrypoint.sh"]
