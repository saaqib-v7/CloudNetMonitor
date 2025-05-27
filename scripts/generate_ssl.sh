#!/bin/bash

# Directory for SSL certificates
SSL_DIR="nginx/ssl"
DAYS_VALID=365
COUNTRY="US"
STATE="State"
LOCALITY="City"
ORGANIZATION="CloudNetMonitor"
ORGANIZATIONAL_UNIT="Development"
COMMON_NAME="localhost"
EMAIL="admin@cloudnetmonitor.local"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate private key
openssl genrsa -out $SSL_DIR/cloudnetmonitor.key 2048

# Generate CSR
openssl req -new -key $SSL_DIR/cloudnetmonitor.key -out $SSL_DIR/cloudnetmonitor.csr \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL"

# Generate self-signed certificate
openssl x509 -req -days $DAYS_VALID \
    -in $SSL_DIR/cloudnetmonitor.csr \
    -signkey $SSL_DIR/cloudnetmonitor.key \
    -out $SSL_DIR/cloudnetmonitor.crt

# Remove CSR as it's no longer needed
rm $SSL_DIR/cloudnetmonitor.csr

echo "SSL certificates generated in $SSL_DIR:"
ls -l $SSL_DIR 