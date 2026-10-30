import Link from 'next/link';
import { listPosts } from '@/lib/db';
import { dayRu } from '@/lib/format';

export default function AdminPosts() {
  const posts = listPosts({ all: true });
  return (
    <div className="adm__main">
      <div className="adm__actions" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Хроника</h1>
        <Link href="/admin/posts/new" className="btn">
          Новая запись
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Заголовок</th>
              <th>Рубрика</th>
              <th>Видимость</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{dayRu(p.date)}</td>
                <td>
                  <Link href={`/admin/posts/${p.id}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>
                    {p.title}
                  </Link>
                </td>
                <td>{p.rubric}</td>
                <td>{p.published ? <span className="tag tag--ok">Опубликована</span> : <span className="tag">Черновик</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {posts.length === 0 && <p className="empty">Записей пока нет.</p>}
    </div>
  );
}
