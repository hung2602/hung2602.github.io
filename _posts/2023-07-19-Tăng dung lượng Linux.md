---
layout: post
title: Tăng dung lượng ổ đĩa cho Linux
---
## Trước tiên cần thêm dung lượng ổ đĩa vật lý do server
## Sau khi đã tăng thêm dung lượng vật lý thì tiếp theo sẽ cần chọn phân vùng cần tăng
### Tăng disk linux
#### Ở đây ta sẽ tăng thêm dung lượng cho ubuntu--vg-ubuntu--lv đang là 48G thành 98G

```
#lsblk
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0                       7:0    0 116.8M  1 loop /snap/core/14784
loop1                       7:1    0 116.8M  1 loop /snap/core/14946
loop3                       7:3    0  63.3M  1 loop /snap/core20/1852
loop4                       7:4    0  91.9M  1 loop /snap/lxd/24061
loop5                       7:5    0  67.8M  1 loop /snap/lxd/22753
loop6                       7:6    0  53.2M  1 loop /snap/snapd/18933
loop7                       7:7    0  63.3M  1 loop /snap/core20/1879
loop8                       7:8    0   4.2M  1 loop /snap/tree/18
loop9                       7:9    0  53.2M  1 loop /snap/snapd/19122
sda                         8:0    0   100G  0 disk 
├─sda1                      8:1    0     1M  0 part 
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0    48G  0 part 
  └─ubuntu--vg-ubuntu--lv 253:0    0    48G  0 lvm  /
sr0                        11:0    1   1.3G  0 rom  
```

#### Step01 :
root@proxy:~# fdisk /dev/sda 
- Xoa partition sda3

```
Command (m for help):p
Device       Start       End   Sectors Size Type
/dev/sda1     2048      4095      2048   1M BIOS boot
/dev/sda2     4096   4198399   4194304   2G Linux filesystem
/dev/sda3  4198400 104855551 100657152  48G Linux filesystem

Command (m for help):d
Partition number (1-3, default 3): 3
Partition 3 has been deleted
```

- Tạo lại partition sda3 để default sẽ nhận toàn bộ dung lượng còn trống chưa sử dụng của /dev/sda

```
Command (m for help): n
Partition number (3-128, default 3): 
First sector (4198400-209715166, default 4198400): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (4198400-209715166, default 209715166): 

Created a new partition 3 of type 'Linux filesystem' and of size 98 GiB.
Partition #3 contains a LVM2_member signature.

Do you want to remove the signature? [Y]es/[N]o: n
```

- Kiểm tra lại xem đã nhận đủ dung lượng chưa

```
Command (m for help): p
Device       Start       End   Sectors Size Type
/dev/sda1     2048      4095      2048   1M BIOS boot
/dev/sda2     4096   4198399   4194304   2G Linux filesystem
/dev/sda3  4198400 209715166 205516767  98G Linux filesystem

#Đã xong giờ thì lưu lại và thoát ra
Command (m for help): w
Command (m for help): q
```
- Kiểm tra lại

```
root@proxy:~# lsblk
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0                       7:0    0 116.8M  1 loop /snap/core/14784
loop1                       7:1    0 116.8M  1 loop /snap/core/14946
loop3                       7:3    0  63.3M  1 loop /snap/core20/1852
loop4                       7:4    0  91.9M  1 loop /snap/lxd/24061
loop5                       7:5    0  67.8M  1 loop /snap/lxd/22753
loop6                       7:6    0  53.2M  1 loop /snap/snapd/18933
loop7                       7:7    0  63.3M  1 loop /snap/core20/1879
loop8                       7:8    0   4.2M  1 loop /snap/tree/18
loop9                       7:9    0  53.2M  1 loop /snap/snapd/19122
sda                         8:0    0   100G  0 disk
├─sda1                      8:1    0     1M  0 part
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0    98G  0 part
└─ubuntu--vg-ubuntu--lv 253:0    0    48G  0 lvm  /
sr0                        11:0    1   1.3G  0 rom
```

- show logical volume \
root@proxy:~# lvdisplay

```
--- Logical volume ---
LV Path                /dev/ubuntu-vg/ubuntu-lv
LV Name                ubuntu-lv
VG Name                ubuntu-vg
LV UUID                4QbFSy-CcV3-Ao35-yzeV-SyDB-Vbv6-Q3poyh
LV Write Access        read/write
LV Creation host, time ubuntu-server, 2022-12-12 12:03:07 +0700
LV Status              available
# open                 1
LV Size                <48.00 GiB
Current LE             12287
Segments               1
Allocation             inherit
Read ahead sectors     auto
- currently set to     256
  Block device           253:0
```

#### Tăng size logical volume /dev/ubuntu-vg/ubuntu-lv

#### Mở rộng PV để sử dụng phần còn lại của phân vùng mới được mở rộng:
> pvresize /dev/sda2

#### Tăng 100% dung lượng còn trống cho lvm /dev/ubuntu-vg/ubuntu-lv
> lvextend -l +100%FREE /dev/centos/root

#### Bước cuối cùng là resize lại file system sử dụng resize2fs
ubuntu su dung
> resize2fs /dev/centos/root

centos 7 su dung
>xfs_growfs /dev/centos/root

- Kết quả \
root@proxy:~# lsblk

```
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
loop0                       7:0    0 116.8M  1 loop /snap/core/14784
loop1                       7:1    0 116.8M  1 loop /snap/core/14946
loop3                       7:3    0  63.3M  1 loop /snap/core20/1852
loop4                       7:4    0  91.9M  1 loop /snap/lxd/24061
loop5                       7:5    0  67.8M  1 loop /snap/lxd/22753
loop6                       7:6    0  53.2M  1 loop /snap/snapd/18933
loop7                       7:7    0  63.3M  1 loop /snap/core20/1879
loop8                       7:8    0   4.2M  1 loop /snap/tree/18
loop9                       7:9    0  53.2M  1 loop /snap/snapd/19122
sda                         8:0    0   100G  0 disk
├─sda1                      8:1    0     1M  0 part
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0    98G  0 part
└─ubuntu--vg-ubuntu--lv 253:0    0    98G  0 lvm  /
```

root@proxy:~# df -h

```
Filesystem                         Size  Used Avail Use% Mounted on
udev                               3.9G     0  3.9G   0% /dev
tmpfs                              796M  2.4M  794M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv   97G   24G   69G  26% /
tmpfs                              3.9G     0  3.9G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
```

