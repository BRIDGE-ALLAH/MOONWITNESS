FROM rust:1.78-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml ./

# Create dummy main to build dependencies
RUN mkdir src && echo 'fn main() {}' > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copy actual source
COPY src ./src
COPY config.toml ./

# Build application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/radius /app/radius
COPY --from=builder /app/config.toml /app/config.toml

EXPOSE 1812/udp 1813/udp

CMD ["/app/radius", "--config", "/app/config.toml"]
