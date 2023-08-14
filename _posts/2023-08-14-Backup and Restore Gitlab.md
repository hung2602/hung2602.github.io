---
layout: post
title: 12 - Backup and Restore Gitlab
---
## Backup Gitlab

> docker exec -t gitlab-ce gitlab-backup create

File backup sẽ lưu trong /data/gitlab/data/backups dưới dạng file tar

## Restore Gitlab
Đảm bảo version của Gitlab cần restore trùng với version Gitlab của bản backup

EX: Restore bản backup gitlab có tên gitlab_backup.tar

> docker cp gitlab_backup.tar gitlab-ce:/var/opt/gitlab/backups \
docker exec -it gitlab-ce bash \
chown -R git:git /var/opt/gitlab/backups \
gitlab-rake gitlab:backup:restore gitlab_backup.tar

### Khi restore sẽ lỗi login 2fa cần tắt xác thực 2fa

#### Tắt xác thực 2fa 
docker exec -it gitlab-ce bash

> gitlab-rails console \
user = User.find_by(username: "root") \
user.otp_required_for_login = false \
user.save!

#### Fix lỗi khi tắt 2fa sẽ trả về error 500 

> u = User.find_by(username: "root") \
u.encrypted_otp_secret = nil \
u.encrypted_otp_secret_iv = nil \
u.encrypted_otp_secret_salt = nil \
u.save

#### Một vài cli gitlab-rails console khác
Unlock user

> user = User.find_by(username: "root") \
user.unlock_access!

Reset pass

> user = User.find_by(username: "root") \
user.password = "123" \
user.password_confirmation = "123" \
user.save!


