#!/bin/sh
# Daily backup of the database and uploaded files. Keeps the last 14 days.
# Install (once):  crontab -e   then add:   30 3 * * * /root/lola-ai/deploy/backup.sh >> /root/lola-backup.log 2>&1
set -e
cd "$(dirname "$0")/.."
DIR=/root/lola-backups; mkdir -p "$DIR"; D=$(date +%F)
docker compose exec -T db pg_dump -U lola lola | gzip > "$DIR/db-$D.sql.gz"
docker run --rm -v lola-ai_uploads:/u -v "$DIR":/b alpine tar czf "/b/uploads-$D.tgz" -C /u .
find "$DIR" -type f -mtime +14 -delete
echo "backup ok $D"
