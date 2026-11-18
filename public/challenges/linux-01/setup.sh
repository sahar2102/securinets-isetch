#!/bin/sh
# one-shot bootstrap for the backup volume (2026 rewrite)
install -d -m 750 -o root -g backup /srv/backup
install -m 640 -o root -g backup /root/flag.txt /srv/backup/flag.txt
# quick fix so the monitoring agent could read it during the migration
cp /srv/backup/flag.txt /tmp/backup-flag.txt
chmod 777 /tmp/backup-flag.txt    # TODO: remove after migration
