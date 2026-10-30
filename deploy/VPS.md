# Выкладка на свой сервер (VPS) — настоящий магазин

Подходит недорогой VPS с 1 ГБ памяти на Ubuntu, например Time-Host OVZ-1 (149 ₽/мес на момент проверки). Домен `dualizzm.com` покупается отдельно; в его настройках A-запись должна указывать на IP сервера.

## 1. Подготовить сервер (один раз)

Подключиться: `ssh root@IP_СЕРВЕРА`

```bash
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx git curl
# Node.js 24 LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
npm install -g pm2
node -v   # должно быть v24.x
```

## 2. Загрузить проект

Через GitHub: `git clone https://github.com/ВАШ/dualizzm.git /var/www/dualizzm`
Или без GitHub: скопировать папку проекта программой WinSCP/FileZilla в `/var/www/dualizzm` (без `node_modules`, `.next`, `data`).

```bash
cd /var/www/dualizzm
cp .env.example .env.local
nano .env.local   # SITE_URL=https://dualizzm.com, ADMIN_PASSWORD, AUTH_SECRET, ключи ЮKassa
npm ci            # или npm install, если нет package-lock.json
npm run build
```

Если сборка падает с `JavaScript heap out of memory` (на 1 ГБ это возможно): собери проект у себя на компьютере (`npm run build`) и загрузи готовую папку `.next` на сервер, потом снова `npm ci`.

## 3. Запустить и включить автозапуск

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup      # выполнить команду, которую он выведет
```

Проверка: `curl -I http://127.0.0.1:3000` должен ответить `200`.

## 4. Домен и HTTPS

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/dualizzm
ln -s /etc/nginx/sites-available/dualizzm /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d dualizzm.com -d www.dualizzm.com
```

## 5. Резервные копии

База и фото лежат в `/var/www/dualizzm/data`. Ежедневная копия:

```bash
crontab -e
# добавить строку:
0 4 * * * /var/www/dualizzm/deploy/backup.sh
```

Копии складываются в `/root/backups`, хранятся последние 14. Время от времени скачивай свежую копию к себе.

## Обновление сайта

```bash
cd /var/www/dualizzm
git pull            # или загрузить изменённые файлы
npm ci
npm run build
pm2 restart dualizzm
```

## ЮKassa

В личном кабинете ЮKassa укажи адрес уведомлений `https://dualizzm.com/api/payments/yookassa` (события `payment.succeeded`, `payment.canceled`).
