#!/usr/bin/env bash
# Ежедневная копия базы и фото. В crontab (crontab -e):
# 0 4 * * * /var/www/dualizzm/deploy/backup.sh
set -euo pipefail
APP=/var/www/dualizzm
OUT=/root/backups
mkdir -p "$OUT"
tar czf "$OUT/dualizzm-$(date +%F).tgz" -C "$APP" data
# храним последние 14 копий
ls -1t "$OUT"/dualizzm-*.tgz | tail -n +15 | xargs -r rm --
