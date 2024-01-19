---
layout: post
title: 10 - Tăng dung lượng ổ đĩa cho Linux
---
## Trước tiên cần thêm dung lượng ổ đĩa vật lý do server
## Sau khi đã tăng thêm dung lượng vật lý thì tiếp theo sẽ cần chọn phân vùng cần tăng
### Tăng disk linux
#### Ở đây ta sẽ tăng thêm dung lượng cho ubuntu--vg-ubuntu--lv đang là 14G thành 148G

```
root@ubuntu-84:~/client_api# lsblk
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0                       7:0    0  63.3M  1 loop /snap/core20/1822
loop1                       7:1    0  63.9M  1 loop /snap/core20/2105
loop2                       7:2    0 111.9M  1 loop /snap/lxd/24322
loop4                       7:4    0  40.9M  1 loop /snap/snapd/20290
loop5                       7:5    0  40.4M  1 loop /snap/snapd/20671
sda                         8:0    0   150G  0 disk 
├─sda1                      8:1    0     1M  0 part 
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0    48G  0 part 
  └─ubuntu--vg-ubuntu--lv 253:0    0    24G  0 lvm  /
sr0                        11:0    1   1.8G  0 rom  
```

#### Step01 :
- show physical volumes

```
root@ubuntu-84:~/client_api# pvs
  PV         VG        Fmt  Attr PSize   PFree 
  /dev/sda3  ubuntu-vg lvm2 a--  <48.00g 24.00g
```

- grow cho partition

```
root@ubuntu-84:~/client_api# growpart /dev/sda 3

CHANGED: partition=3 start=4198400 old: size=100657152 end=104855552 new: size=310374367 end=314572767
```

- Kiểm tra lại

```
root@ubuntu-84:~/client_api# lsblk
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0                       7:0    0  63.3M  1 loop /snap/core20/1822
loop1                       7:1    0  63.9M  1 loop /snap/core20/2105
loop2                       7:2    0 111.9M  1 loop /snap/lxd/24322
loop4                       7:4    0  40.9M  1 loop /snap/snapd/20290
loop5                       7:5    0  40.4M  1 loop /snap/snapd/20671
sda                         8:0    0   150G  0 disk 
├─sda1                      8:1    0     1M  0 part 
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0   148G  0 part 
  └─ubuntu--vg-ubuntu--lv 253:0    0    24G  0 lvm  /
sr0                        11:0    1   1.8G  0 rom  
```

- show logical volume \
root@proxy:~# lvdisplay

```
root@ubuntu-84:~/client_api# lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/ubuntu-lv
  LV Name                ubuntu-lv
  VG Name                ubuntu-vg
  LV UUID                gQo3DO-BfxS-JDFA-mKae-paY3-jWBX-f7Ch8I
  LV Write Access        read/write
  LV Creation host, time ubuntu-server, 2023-08-03 10:58:43 +0000
  LV Status              available
  # open                 1
  LV Size                <24.00 GiB
  Current LE             6143
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:0
```

#### Tăng size logical volume /dev/ubuntu-vg/ubuntu-lv

#### Mở rộng PV để sử dụng phần còn lại của phân vùng mới được mở rộng:
> pvresize /dev/sda3

#### Tăng 100% dung lượng còn trống cho lvm /dev/ubuntu-vg/ubuntu-lv
> lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv

#### Bước cuối cùng là resize lại file system sử dụng resize2fs
ubuntu su dung
> resize2fs /dev/ubuntu-vg/ubuntu-lv

centos 7 su dung
>xfs_growfs /dev/ubuntu-vg/ubuntu-lv

- Kết quả \
root@proxy:~# lsblk

```
root@ubuntu-84:~/client_api# lsblk
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
loop0                       7:0    0  63.3M  1 loop /snap/core20/1822
loop1                       7:1    0  63.9M  1 loop /snap/core20/2105
loop2                       7:2    0 111.9M  1 loop /snap/lxd/24322
loop4                       7:4    0  40.9M  1 loop /snap/snapd/20290
loop5                       7:5    0  40.4M  1 loop /snap/snapd/20671
sda                         8:0    0   150G  0 disk 
├─sda1                      8:1    0     1M  0 part 
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0   148G  0 part 
  └─ubuntu--vg-ubuntu--lv 253:0    0   148G  0 lvm  /
sr0                        11:0    1   1.8G  0 rom 
```