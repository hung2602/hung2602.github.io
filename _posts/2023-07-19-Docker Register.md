---
layout: post
title: 11 - Cài đặt docker registry để lưu trữ images nội bộ
---
## Sử dụng docker-compose 

<aside class="warning">
Thay địa chỉ host 10.0.9.65 thành host registry của bạn nhé.
</aside>

### File docker-compose.yml
[docker-compose.yml](/file/docker-registry/docker-compose.yml)
```
version: '3.3'
services:
  registry:
    container_name: docker_registry
    image: registry:2
    ports:
      - "5000:5000"
    volumes:
      - docker-registry:/data
      - ./certs:/data/certs
      - ./auth:/data/auth
    environment:
      REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /data/registry_data
      REGISTRY_HTTP_TLS_CERTIFICATE: /data/certs/domain.crt
      REGISTRY_HTTP_TLS_KEY: /data/certs/domain.key
      REGISTRY_STORAGE_DELETE_ENABLED: "true"
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_PATH: /data/auth/htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm

  registry-ui:
    image: parabuzzle/craneoperator:latest
    ports:
      - "8086:80"
    environment:
      REGISTRY_HOST: 10.0.9.65
      REGISTRY_PORT: 5000
      REGISTRY_PROTOCOL: https
      SSL_VERIFY: "false"
      REGISTRY_ALLOW_DELETE: "true"
      REGISTRY_USERNAME: admin
      REGISTRY_PASSWORD: admin
      USERNAME: admin
      PASSWORD: admin
    restart: always
    depends_on:
      - registry

volumes:
  docker-registry:
    external: yes
```
Phần registry-ui là dashboard hiển thị các images có trong registry không cần thì có thể command lại.

### Trước khi run docker compose cần tạo certs và user password cho registry
Run script sau là xong rồi đó

[docker-compose.yml](/file/docker-registry/cli.sh)

```
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

```
> Thay USER PASS thành cái user và password cần đặt.

### Dưới đây là các lệnh sử dụng registry

```
#tag image
docker tag name_image 10.0.9.65:5000/name_image

#docker login
docker login 10.0.9.65:5000

#push image
docker push 10.0.9.65:5000/name_image

#pull image
docker pull 10.0.9.65:5000/name_image

#show image registry
curl -u user:password -k https://10.0.9.65:5000/v2/_catalog


=============================================================
#fix loi docker  
$vi /etc/docker/daemon.json

{
    "insecure-registries" : ["10.0.9.65:5000"]
}

#systemctl restart docker
```