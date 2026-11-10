FROM rust:1.80-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/legend /usr/local/bin/legend
EXPOSE 8092
ENV PORT=8092
ENV HOST=0.0.0.0
ENV LEGEND_DATA_PATH=/data/legend.db
VOLUME ["/data"]
CMD ["/usr/local/bin/legend"]
