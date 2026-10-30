import type { Metadata } from 'next';
import Legal from '@/components/legal/Legal';

export const metadata: Metadata = { title: 'Файлы cookie' };

const ITEMS = [
  { name: 'dz-cart-v1', where: 'локальное хранилище', what: 'работы в корзине', term: 'пока не очистишь корзину или браузер' },
  { name: 'dz-fav-v1', where: 'локальное хранилище', what: 'избранные работы', term: 'пока не очистишь браузер' },
  { name: 'dz-sound', where: 'локальное хранилище', what: 'включена ли музыка', term: 'пока не очистишь браузер' },
  { name: 'dz-cookie-ok', where: 'локальное хранилище', what: 'что это уведомление уже показано', term: 'пока не очистишь браузер' },
  { name: 'dz-intro', where: 'хранилище сессии', what: 'что заставку уже показали', term: 'до закрытия вкладки' },
  { name: 'dz_admin', where: 'cookie', what: 'вход в панель управления, только для владельца сайта', term: '7 дней' },
];

export default function CookiesPage() {
  return (
    <Legal title="Файлы cookie" current="/legal/cookies">
      <p>
        Сайт хранит в браузере только то, без чего он не работает или работает неудобно. Рекламных, аналитических и сторонних cookie нет. Эти данные не
        уходят никому и не используются, чтобы следить за тобой.
      </p>

      <h2>Что именно хранится</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Где</th>
              <th>Зачем</th>
              <th>Сколько хранится</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((i) => (
              <tr key={i.name}>
                <td><code>{i.name}</code></td>
                <td>{i.where}</td>
                <td>{i.what}</td>
                <td>{i.term}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Как отключить</h2>
      <p>
        Cookie и хранилище можно очистить или запретить в настройках браузера. Сайт продолжит открываться, но корзина и избранное перестанут
        запоминаться.
      </p>
      <p className="note">Если на сайте появится аналитика (например, счётчик посещений), этот список обновится, и перед её включением появится запрос согласия.</p>
    </Legal>
  );
}
