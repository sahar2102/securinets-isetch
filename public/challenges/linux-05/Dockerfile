FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y cron tar && rm -rf /var/lib/apt/lists/*
RUN useradd -m web && mkdir -p /var/www/site /backup && chown -R web:web /var/www/site
COPY backup.sh /opt/backup.sh
COPY cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup && echo 'FLAG=SNT{gl0bb1ng_1s_d4ng3r0u5}' > /root/flag.txt
RUN chmod 0600 /root/flag.txt
USER web
WORKDIR /var/www/site
CMD ["cron", "-f"]
