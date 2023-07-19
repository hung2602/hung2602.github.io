---
layout: post
title: [Blog 9] Kết nối nhiều session RDP trên windows server 2019 cùng 1 lúc
---

# Sử dụng tool RDP wrapper

### Download RDP wapper về máy
Link driver
> https://drive.google.com/drive/folders/13tZPIuJOJBqaobeWv7Kn07rWwe_gmGtq?usp=sharing


### Bước 1: Chạy file install sau khi đã giải nén.
![images](/images/rdp-1.png )

### Bước 2: Chạy file RDPConf.exe sẽ xuất hiện dòng [not supported]

### Bước 3: Copy file rdpwrap.ini từ folder đã tải về vào folder C:\Program Files\RDP Wrapper
![images](/images/rdp-2.png )

### Bước 4: Chạy file update 
![images](/images/rdp-3.png )

### Bước 5: Chạy lại file RDPConf.exe kiểm tra thấy đã chuyển từ [not supported] -> [fully supported]
![images](/images/rdp-4.png )

### Vậy là có thể remote nhiều user cùng 1 lúc rồi đó !!!