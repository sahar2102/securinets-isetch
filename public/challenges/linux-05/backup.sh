#!/bin/sh
cd /var/www/site || exit 1
tar -czf /backup/site.tgz *
