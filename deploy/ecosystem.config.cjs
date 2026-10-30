// PM2: держит сайт запущенным и поднимает после перезагрузки сервера.
// Запуск из папки проекта: pm2 start deploy/ecosystem.config.cjs && pm2 save
const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'dualizzm',
      cwd: path.join(__dirname, '..'),
      script: 'scripts/next.mjs',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '600M',
    },
  ],
};
