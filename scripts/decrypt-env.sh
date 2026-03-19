#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENC_FILE="$ROOT_DIR/.env.enc"
HMAC_FILE="$ROOT_DIR/.env.enc.sha256"

if [[ -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE already exists." >&2
  echo "Delete it first (or move it aside), then re-run this script." >&2
  exit 1
fi

if [[ ! -f "$ENC_FILE" ]]; then
  echo "Error: $ENC_FILE not found. Ask for it or run scripts/encrypt-env.sh." >&2
  exit 1
fi

if [[ ! -f "$HMAC_FILE" ]]; then
  echo "Error: $HMAC_FILE not found. It must be committed alongside $ENC_FILE." >&2
  exit 1
fi

read -r -s -p "Enter passphrase (will not echo): " PASSPHRASE
echo

if [[ -z "$PASSPHRASE" ]]; then
  echo "Error: passphrase cannot be empty." >&2
  exit 1
fi

COMBINED_PASSPHRASE="$PASSPHRASE"

EXPECTED_HMAC="$(tr -d '\r\n' < "$HMAC_FILE")"
ACTUAL_HMAC="$(openssl dgst -sha256 -hmac "$COMBINED_PASSPHRASE" "$ENC_FILE" | awk '{print $2}')"

if [[ -z "$EXPECTED_HMAC" ]]; then
  echo "Error: integrity file is empty ($HMAC_FILE)." >&2
  exit 1
fi

if [[ "$EXPECTED_HMAC" != "$ACTUAL_HMAC" ]]; then
  echo "Error: integrity check failed." >&2
  echo "- Wrong password/passphrase, or" >&2
  echo "- Encrypted file was modified/corrupted." >&2
  exit 1
fi

printf '%s' "$COMBINED_PASSPHRASE" | \
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 \
    -in "$ENC_FILE" -out "$ENV_FILE" -pass stdin

chmod 600 "$ENV_FILE" || true

echo "Decrypted $ENC_FILE -> $ENV_FILE"
