#!/bin/sh
set -eu
mkdir -p "${GIT_DATA_DIR:-/data/git}"
# Bind-mounted folders may be created by Docker as root. Give the data directory
# to the unprivileged runtime account before dropping privileges.
chown bun:bun "${GIT_DATA_DIR:-/data/git}"
exec gosu bun bun run src/index.ts
