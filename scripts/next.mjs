// Запускает Next так, чтобы встроенный SQLite (node:sqlite) работал на любой версии Node 22.5+.
// В Node 22.5–22.12 он включается только флагом --experimental-sqlite, в новых версиях доступен сразу.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const env = { ...process.env };

if (!process.getBuiltinModule?.('node:sqlite')) {
  env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ''} --experimental-sqlite`.trim();
}

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], { stdio: 'inherit', env });

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
