# Deployment runbook

Live URL: **https://15.252.126.21.sslip.io**. Region: `ap-south-1`. AWS CLI profile: `piyush-iam2-wemakedevs`. Lightsail instance: `pocket-pact-web` (`micro_3_1`); attached static IP: `pocket-pact` (`15.252.126.21`). The VM runs Caddy, Node 22, PostgreSQL and the `pocket-pact` systemd service. [ARCHITECTURE.md](ARCHITECTURE.md) shows the deployed and planned CloudFront paths.

The initial VM was provisioned with `bootstrap.sh`, Node 22, a local PostgreSQL role/database, 1 GB swap, and `/etc/caddy/Caddyfile`. The production env file is `/opt/pocket-pact/.env.local`, owned by `pocketpact` with mode `600`. It sets `APP_ORIGIN`, `DATABASE_URL`, API bind settings, and the existing provider keys. Never copy this file into git or a release archive. The SSH key is local at `~/.ssh/pocket-pact-lightsail.pem` and is also excluded from git.

To ship an already tested release from the repository root:

```sh
npm ci
npm test && npm run lint && npm run build
tar -czf /tmp/pocket-pact-release.tgz dist package.json package-lock.json deploy/Caddyfile
scp -i ~/.ssh/pocket-pact-lightsail.pem /tmp/pocket-pact-release.tgz ubuntu@15.252.126.21:/tmp/
ssh -i ~/.ssh/pocket-pact-lightsail.pem ubuntu@15.252.126.21 \
  'sudo tar -xzf /tmp/pocket-pact-release.tgz -C /opt/pocket-pact && sudo chown -R pocketpact:pocketpact /opt/pocket-pact/dist && sudo -u pocketpact sh -c "cd /opt/pocket-pact && npm ci --omit=dev" && sudo cp /opt/pocket-pact/deploy/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy && sudo systemctl restart pocket-pact'
curl -fsS https://15.252.126.21.sslip.io/api/health
```

Before a major release, back up the local PostgreSQL database with `pg_dump` on the instance and store the archive away from the VM. To inspect service failures, use `sudo journalctl -u pocket-pact -n 100 --no-pager` and `sudo journalctl -u caddy -n 100 --no-pager` over SSH. The app records expenses and contributions, but does not move real money.

CloudFront distribution creation returned an AWS account-verification `AccessDenied`; none exists yet. After AWS verifies the account, configure a distribution for the current HTTPS origin, forward `/api/*` without caching and with cookies, and switch `APP_ORIGIN` and DNS to the public CloudFront hostname. Test cookies, authenticated receipts and CSRF checks through that hostname before announcing it. Until then, the live site uses Caddy HTTPS directly.
