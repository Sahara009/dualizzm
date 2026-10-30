import MessageCard from '@/components/admin/MessageCard';
import { listMessages } from '@/lib/db';

export default function AdminMessages() {
  const messages = listMessages();
  const unread = messages.filter((m) => !m.read).length;
  return (
    <div className="adm__main">
      <h1>Сообщения</h1>
      <p className="note">Всего: {messages.length}, новых: {unread}. Сообщения приходят из формы «Написать мне».</p>
      {messages.length === 0 ? (
        <p className="empty">Сообщений пока нет. Они появятся, когда кто-нибудь заполнит форму на странице «Обо мне».</p>
      ) : (
        messages.map((m) => <MessageCard key={m.id} m={m} />)
      )}
    </div>
  );
}
