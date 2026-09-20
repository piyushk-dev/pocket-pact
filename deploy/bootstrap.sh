#!/bin/bash
set -eu
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq caddy curl ca-certificates postgresql
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs
useradd --system --create-home --home-dir /opt/pocket-pact --shell /usr/sbin/nologin pocketpact || true
mkdir -p /opt/pocket-pact/.data
chown -R pocketpact:pocketpact /opt/pocket-pact
cat > /etc/systemd/system/pocket-pact.service <<'SERVICE'
[Unit]
Description=Pocket Pact API
After=network.target
[Service]
User=pocketpact
WorkingDirectory=/opt/pocket-pact
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --env-file=/opt/pocket-pact/.env.local /opt/pocket-pact/dist/api/index.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/pocket-pact/.data
[Install]
WantedBy=multi-user.target
SERVICE
systemctl daemon-reload
