# Deploy: Yandex Cloud (Frontend)

See also [`studio_back_new/DEPLOY.md`](../studio_back_new/DEPLOY.md) for the full migration checklist.

## This repo provides
- `Dockerfile` (Next.js `standalone`)
- `deploy/docker-compose.yml` + `Caddyfile.stage` / `Caddyfile.prod`
- `.github/workflows/deploy-fe.yml`

## GitHub Environment (per `stage` / `prod`)

**Secrets:** `YC_SA_JSON`, `SSH_KEY`

**Variables:**
| Variable | Purpose |
|----------|---------|
| `YCR_ID` | Container Registry id |
| `SSH_HOST` | FE VM public IP |
| `SSH_USER` | `strn` |
| `NEXT_PUBLIC_API_URL` | optional; иначе stage→`api-stage`, prod→`api` |

`NEXT_PUBLIC_API_URL` вшивается в образ на **build**.

## VM prep
```bash
sudo mkdir -p /opt/studio-fe && sudo chown "$USER" /opt/studio-fe
# Docker Engine + Compose plugin installed
```

## Triggers
- push to `stage` → deploy **stage**
- push to `main` → deploy **prod**
- `workflow_dispatch` → choose `stage` or `prod`
