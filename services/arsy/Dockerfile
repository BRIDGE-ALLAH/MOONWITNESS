FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json ./
RUN bun install --production
COPY src ./src
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    ARSY_PORT=4000
USER bun
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:4000/health"]
CMD ["bun", "run", "src/index.ts"]
