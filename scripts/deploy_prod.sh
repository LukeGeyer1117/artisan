#!/bin/bash
set -e # Exit on any error
set -o pipefail

# CONFIG
PROJECT_DIR="/home/ubuntu/artisan/artisan"
VENV_DIR="/home/ubuntu/venv"
STATIC_DIR="$PROJECT_DIR/static/css"
GUNICORN_SERVICE="artisan.service"
ENV_FILE="$PROJECT_DIR/.env"

cd "$PROJECT_DIR"

echo "Exporting environment variables..."
export $(grep -v '^#' ~/artisan/artisan/.env | xargs)

# GIT PULL
echo "Pulling updates..."
git pull

# VIRTUAL ENVIRONMENT
echo "Entering Virtual environment..."
source "$VENV_DIR/bin/activate"

# COMPILE CSS
$PROJECT_DIR/static/css/tailwindcss -i $PROJECT_DIR/static/css/input.css -o $PROJECT_DIR/static/css/output.css

# COLLECT STATIC FILES
echo "Collecting static files..."
python3 "$PROJECT_DIR/manage.py" collectstatic --noinput --clear

# APPLY DB MIGRATION
echo "Applying DB migrations..."
python3 "$PROJECT_DIR/manage.py" migrate --noinput

# RESTART_SERVICES
echo "Restarting Gunicorn..."
sudo systemctl daemon-reload
sudo systemctl restart "$GUNICORN_SERVICE"
sudo systemctl status "$GUNICORN_SERVICE" --no-pager

# RESTART NGINX
echo "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager

# COMPLETE
echo "Deployment Complete"
