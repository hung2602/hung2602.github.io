#!/bin/bash
USER="admin"
PASS="admin"

mkdir certs
mkdir auth

openssl req \
-x509 \
-newkey rsa:4096 \
-sha256 \
-days 3560 \
-nodes \
-keyout ./certs/domain.key \
-out ./certs/domain.crt \
-subj '/CN=myregistrydomain.com' \
-extensions san \
-config <( \
  echo '[req]'; \
  echo 'distinguished_name=req'; \
  echo '[san]'; \
  echo 'subjectAltName=IP:10.0.9.65')

echo 'Done gen certs' && \
htpasswd -Bbc ./auth/htpasswd $USER $PASS && \
echo 'done set user password' && \

docker volume create --name=docker-registry && \
docker-compose up -d
