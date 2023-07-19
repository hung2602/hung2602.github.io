---
layout: post
title: 8 - Cài đặt và cấu hình airflow (quản lý jobs tập trung)
---
### 1.File docker-compose.yml 
[docker-compose.yml](/file/airflow/docker-compose.yml)

### 2.File airflow.cfg sẽ được cấu hình lại để chuyển múi giờ về Asia/Ho_Chi_Minh và tắt các example dag đi. 
[airflow.cfg](/file/airflow/airflow.cfg)

### 3.Sau khi cấu hình đủ 2 file trên thì chạy script sau để chạy airflow
> mkdir -p ./dags ./logs ./plugins ./config \
echo -e "AIRFLOW_UID=50000" > .env \
docker compose up airflow-init 

### 4.Vậy là đã hoàn thành cài đặt airflow 
Bây giờ cần viết các dags để chạy jobs. Ở đây mình sẽ sử dụng python để viết dags. \
Các dags sẽ đặt ở trong thư mục dags

```bash
from airflow import DAG
from config.notify import send_telegram
from config.default import default_args
from config import connect 

def dag_config(dag_id,tags,schedule_interval):
    return DAG(
    dag_id=dag_id,
    default_args=default_args,
    tags=tags,
    description='DAG for remote task',
    schedule_interval=schedule_interval,
    catchup=False
)

#dag = dag_config(dag_id,tags,schedule)
dag = dag_config(
    'sandbox_jobs_backup_kong_10.0.9.62',
    ['10.0.9.62','sandbox','postgresql'],
    '0 0 * * *')

task1 = connect.create_ssh_operator_62(
    "backup_kong",
    '/bin/bash /opt/script_backup/kong_postgresql.sh ',
    dag
)

task2 = connect.create_ssh_operator_62(
    "dlt_file_out_date",
    'find /opt/kong/db-data/backup/ -mtime +5 -delete',
    dag
)

tasknotify = send_telegram(dag,dag.dag_id)

task1 >> task2 >> tasknotify
```

> ở đây sẽ có 2 task chạy cùng 1 dag và sẽ báo lỗi về chat bot của telegram khi có lỗi 

Module default

```bash
from datetime import datetime
from datetime import timedelta

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 6, 1),
    'retries': 2,
    'retry_delay':timedelta(seconds=60)
}
```
Module connect

```bash
from airflow.contrib.operators.ssh_operator import SSHOperator

import paramiko

def create_ssh_operator_62(task_id, command, dag):
    return SSHOperator(
        task_id=task_id,
        ssh_conn_id='ssh_conn_62',
        cmd_timeout=7200,
        command=command,
        dag=dag
    )

```

Module notify
```bash
from airflow.operators.python_operator import PythonOperator
import requests

def send_telegram_message(dag_id):
    bot_token = 'BOTTOKEN'  # Thay bằng mã token của bot Telegram của bạn
    chat_id = 'chat_id'  # Thay bằng chat_id của cuộc trò chuyện hoặc nhóm bạn muốn gửi thông báo đến
    message = 'Job Failed\nDAG:  {}'.format(dag_id)
    url = f'https://api.telegram.org/bot[BOTTOKEN]/sendMessage'
    payload = {'chat_id': chat_id, 'text': message}
    response = requests.post(url, json=payload)
    if response.status_code != 200:
        raise Exception('Failed to send Telegram message')

def send_telegram(dag,dag_id):
    return PythonOperator(
        task_id="notify_send_telegram",
        python_callable=send_telegram_message,
        op_kwargs={'dag_id': dag_id},
        provide_context=True,
        trigger_rule='one_failed',
        dag=dag
    )
```

Sau khi cấu hình xong trên dashboard sẽ hiển thị như sau:

![images](/images/airflow-sandbox.png )

Khi này tất cả thông tin về job chạy thành công hay thất bại đều được hiển thị 1 cách rõ ràng và có cả logs để xem.

![images](/images/airflow-logs.png )