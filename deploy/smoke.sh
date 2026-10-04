#!/usr/bin/env bash
# Fails unless every key page answers 200 and the security headers arrive.
#
#   deploy/smoke.sh http://127.0.0.1:3101
#   deploy/smoke.sh https://filhmar.online
set -euo pipefail

base="${1:?usage: smoke.sh <base-url>}"
fail=0
for path in / /work/usapp /notes /certifications /ask /sitemap.xml /robots.txt /api/health; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base$path" || echo 000)
  printf '%s %s\n' "$code" "$path"
  [ "$code" = 200 ] || fail=1
done

if ! curl -sI --max-time 15 "$base/" | grep -qi '^content-security-policy:'; then
  echo "smoke: Content-Security-Policy header is missing" >&2
  fail=1
fi
exit "$fail"
