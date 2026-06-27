FROM postgres:16-alpine

# Save original Postgres entrypoint
RUN cp /usr/local/bin/docker-entrypoint.sh /usr/local/bin/postgres-entrypoint.sh

# Install Node.js and pnpm
RUN apk add --no-cache nodejs pnpm bash

# Copy our custom entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use our custom entrypoint that extends the official one
ENTRYPOINT ["/entrypoint.sh"]
