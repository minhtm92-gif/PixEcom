#!/bin/bash
# Remove SSL certificate and nginx config for a custom domain
# Usage: remove-ssl.sh <hostname>
# Must run as root. Called by NestJS DomainsSslService.
set -e

HOSTNAME="$1"
NGINX_CONF="/etc/nginx/sites-available/pixecom-domain-${HOSTNAME}"
NGINX_LINK="/etc/nginx/sites-enabled/pixecom-domain-${HOSTNAME}"

if [ -z "$HOSTNAME" ]; then
  echo "ERROR: Hostname is required"
  exit 1
fi

# Remove nginx config
rm -f "$NGINX_LINK"
rm -f "$NGINX_CONF"

# Revoke and delete certificate (non-blocking, best-effort)
certbot delete --cert-name "$HOSTNAME" --non-interactive 2>/dev/null || true

# Reload nginx
nginx -t && systemctl reload nginx

echo "SSL_REMOVED:${HOSTNAME}"
