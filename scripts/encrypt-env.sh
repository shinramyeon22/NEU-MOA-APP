#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENC_FILE="$ROOT_DIR/.env.enc"
HMAC_FILE="$ROOT_DIR/.env.enc.sha256"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found. Create it (or decrypt) first." >&2
  exit 1
fi

read -r -s -p "Enter passphrase (will not echo): " PASSPHRASE
echo
read -r -s -p "Confirm passphrase: " PASSPHRASE_CONFIRM
echo

if [[ -z "$PASSPHRASE" ]]; then
  echo "Error: passphrase cannot be empty." >&2
  exit 1
fi

if [[ "$PASSPHRASE" != "$PASSPHRASE_CONFIRM" ]]; then
  echo "Error: passphrases do not match." >&2
  exit 1
fi

# The typed passphrase is never written to disk.
COMBINED_PASSPHRASE="$PASSPHRASE"

# NOTE: `openssl enc` does not support AEAD ciphers (like GCM) in some builds.
# We use AES-256-CBC + PBKDF2 for encryption, and generate a separate HMAC
# to provide tamper detection.
# -salt ensures unique encryption for same plaintext.
# -pbkdf2/-iter harden against brute force.
printf '%s' "$COMBINED_PASSPHRASE" | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -md sha256 \
    -in "$ENV_FILE" -out "$ENC_FILE" -pass stdin

# Integrity file (commit alongside .env.enc)
openssl dgst -sha256 -hmac "$COMBINED_PASSPHRASE" "$ENC_FILE" | awk '{print $2}' > "$HMAC_FILE"

chmod 600 "$ENC_FILE" || true
chmod 600 "$HMAC_FILE" || true

echo "Encrypted $ENV_FILE -> $ENC_FILE"
echo "Wrote integrity check -> $HMAC_FILE"
