FROM rust:1-slim-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 --home /data legend \
    && mkdir -p /data && chown legend /data
COPY --from=builder /app/target/release/legend /usr/local/bin/legend
USER legend
ENV LEGEND_HOST=0.0.0.0 \
    LEGEND_PORT=8092 \
    LEGEND_DATA_PATH=/data/legend.db
EXPOSE 8092
VOLUME ["/data"]
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 CMD ["/usr/local/bin/legend", "healthcheck"]
ENTRYPOINT ["/usr/local/bin/legend"]
