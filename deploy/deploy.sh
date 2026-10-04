#!/usr/bin/env bash
# Deploys one signed image to staging or production on this server.
#
#   deploy/deploy.sh staging    ghcr.io/owner/repo@sha256:...
#   deploy/deploy.sh production ghcr.io/owner/repo@sha256:...
#
# 1. Refuses anything not pinned by digest, or not signed by this repo's
#    pipeline on master (cosign keyless).
# 2. Refuses to start if a container this pipeline did not start holds the port.
# 3. Production only: decrypts deploy/env/production.env.enc with SOPS into a
#    private temp file that is deleted when the script exits.
# 4. Starts the image and waits for its healthcheck.
# 5. Production only: if it never turns healthy, puts the previous image back.
set -euo pipefail

usage="usage: deploy.sh <staging|production> <image@sha256:...>"
env_name="${1:?$usage}"
image="${2:?$usage}"
cd "$(dirname "$0")/.."

case "$env_name" in
  staging) project=portfolio-staging port=3101 ;;
  production) project=portfolio port=3001 ;;
  *) echo "deploy: unknown environment '$env_name'" >&2; exit 2 ;;
esac
compose=(docker compose -p "$project" -f "docker-compose.$env_name.yml")

case "$image" in
  *@sha256:*) ;;
  *) echo "deploy: refusing '$image': deploys go by digest only" >&2; exit 2 ;;
esac

repo="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is set by the Actions runner}"
cosign verify "$image" \
  --certificate-identity "https://github.com/$repo/.github/workflows/pipeline.yml@refs/heads/master" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com >/dev/null
echo "deploy: signature verified for $image"

holder=$(docker ps --format '{{.Names}}|{{.Label "com.docker.compose.project"}}|{{.Ports}}' |
  grep -F ":$port->" || true)
if [ -n "$holder" ] && [ "$(cut -d'|' -f2 <<<"$holder")" != "$project" ]; then
  echo "deploy: port $port is held by container '$(cut -d'|' -f1 <<<"$holder")'," \
    "which this pipeline did not start. Stop it once by hand (README, First deploy)." >&2
  exit 1
fi

if [ "$env_name" = production ]; then
  encrypted=deploy/env/production.env.enc
  if [ ! -f "$encrypted" ]; then
    echo "deploy: $encrypted is missing (README, Production secrets)" >&2
    exit 1
  fi
  ENV_FILE=$(mktemp)
  chmod 600 "$ENV_FILE"
  trap 'rm -f "$ENV_FILE"' EXIT
  sops --decrypt --input-type dotenv --output-type dotenv "$encrypted" >"$ENV_FILE"
  export ENV_FILE
fi

previous=$(docker inspect -f '{{.Config.Image}}' "$project-web-1" 2>/dev/null || true)
export IMAGE="$image"

if ! "${compose[@]}" up -d --wait --wait-timeout 120; then
  echo "deploy: $image did not become healthy" >&2
  "${compose[@]}" logs --tail 50 web >&2 || true
  if [ "$env_name" = production ] && [ -n "$previous" ] && [ "$previous" != "$image" ]; then
    echo "deploy: rolling back to $previous" >&2
    IMAGE="$previous" "${compose[@]}" up -d --wait --wait-timeout 120
  fi
  exit 1
fi
echo "deploy: $env_name is healthy on 127.0.0.1:$port"

if [ "$env_name" = production ]; then
  echo "$(date -u +%FT%TZ) $image" >>"$HOME/portfolio-deploys.log"
  # Keep the three newest images of this repo for quick rollbacks.
  docker images "${image%@*}" --format '{{.ID}}' | awk '!seen[$0]++' | tail -n +4 |
    xargs -r docker rmi >/dev/null 2>&1 || true
fi
