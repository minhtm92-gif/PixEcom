#!/bin/bash
# Auto SSL provisioning for custom domains
# Usage: provision-ssl.sh <hostname>
# Must run as root. Called by NestJS DomainsSslService.
set -e

HOSTNAME="$1"
NGINX_CONF="/etc/nginx/sites-available/pixecom-domain-${HOSTNAME}"
NGINX_LINK="/etc/nginx/sites-enabled/pixecom-domain-${HOSTNAME}"
SSL_EMAIL="${SSL_EMAIL:-admin@pixelxlab.com}"
CERTBOT_DIR="/var/www/certbot"

if [ -z "$HOSTNAME" ]; then
  echo "ERROR: Hostname is required"
  exit 1
fi

# Validate hostname (basic check - alphanumeric, dots, hyphens only)
if ! echo "$HOSTNAME" | grep -qP '^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*$'; then
  echo "ERROR: Invalid hostname format"
  exit 1
fi

# Ensure certbot directory exists
mkdir -p "$CERTBOT_DIR"

# Step 1: Create nginx server block (HTTP + HTTPS proxy, SSL placeholder)
cat > "$NGINX_CONF" << 'NGINX_EOF'
# Auto-generated for custom domain: HOSTNAME_PLACEHOLDER
server {
    listen 80;
    listen [::]:80;
    server_name HOSTNAME_PLACEHOLDER;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name HOSTNAME_PLACEHOLDER;

    # Temporary self-signed cert (certbot will replace these)
    ssl_certificate /etc/letsencrypt/live/HOSTNAME_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/HOSTNAME_PLACEHOLDER/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss font/truetype font/opentype image/svg+xml;

    # Upload files
    location /uploads {
        alias /var/www/pixecom/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API Routes
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    # Next.js static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection "";
    }

    # All other routes - proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }
}
NGINX_EOF

# Replace hostname placeholder
sed -i "s/HOSTNAME_PLACEHOLDER/${HOSTNAME}/g" "$NGINX_CONF"

# Step 2: Remove the 443 block temporarily (certbot needs to add SSL itself)
# Keep only the port 80 block for the initial setup
cat > "$NGINX_CONF" << NGINX_EOF
# Auto-generated for custom domain: ${HOSTNAME}
server {
    listen 80;
    listen [::]:80;
    server_name ${HOSTNAME};

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Proxy to app while waiting for SSL
    location /uploads {
        alias /var/www/pixecom/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /_next/image {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Connection "";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
    }
}
NGINX_EOF

# Step 3: Enable the site
ln -sf "$NGINX_CONF" "$NGINX_LINK"

# Step 4: Test and reload nginx (needed for ACME HTTP challenge)
nginx -t || { echo "ERROR: nginx config test failed"; rm -f "$NGINX_LINK" "$NGINX_CONF"; exit 1; }
systemctl reload nginx

# Step 5: Run certbot to obtain SSL certificate
# --nginx flag lets certbot auto-configure the HTTPS server block
certbot --nginx -d "$HOSTNAME" \
  --non-interactive \
  --agree-tos \
  --email "$SSL_EMAIL" \
  --redirect \
  --no-eff-email

# Step 6: Reload nginx with the new SSL config
nginx -t || { echo "ERROR: nginx config test failed after certbot"; exit 1; }
systemctl reload nginx

# Step 7: Output certificate expiry date for the NestJS service to parse
CERT_PATH="/etc/letsencrypt/live/${HOSTNAME}/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
  EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
  echo "SSL_SUCCESS:${EXPIRY}"
else
  echo "ERROR: Certificate file not found after certbot"
  exit 1
fi
