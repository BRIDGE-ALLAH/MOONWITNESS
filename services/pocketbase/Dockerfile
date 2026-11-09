FROM alpine:3.22

ARG PB_VERSION=0.41.1
ARG TARGETARCH
RUN apk add --no-cache ca-certificates curl unzip \
  && mkdir -p /pb/pb_data /pb/pb_migrations \
  && curl -fsSL "https://ganigeorgiev.com/meta/pocketbase/pocketbase/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -o /tmp/pocketbase.zip \
  && unzip /tmp/pocketbase.zip -d /pb \
  && rm /tmp/pocketbase.zip \
  && chmod +x /pb/pocketbase

WORKDIR /pb
EXPOSE 8091
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8091", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]
