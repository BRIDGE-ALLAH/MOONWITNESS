FROM oven/bun:1

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates gosu \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN bun install --filter @local-git/engine --production \
  && mkdir -p /data/git \
  && chown -R bun:bun /app /data \
  && chmod +x /app/services/git-engine/entrypoint.sh

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3200
EXPOSE 3200
WORKDIR /app/services/git-engine
ENTRYPOINT ["/app/services/git-engine/entrypoint.sh"]
