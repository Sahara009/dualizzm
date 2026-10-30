import type { Metadata } from 'next';
import { Masthead, PostItem, PostLead } from '@/components/Chronicle';
import { listPosts } from '@/lib/db';

export const metadata: Metadata = { title: 'Хроника', description: 'Новости мастерской dualizzm: город, работы, выставки, процесс.' };

export default function JournalPage() {
  const posts = listPosts();
  const [lead, ...rest] = posts;
  return (
    <div className="page-top news news--page">
      <Masthead count={posts.length} date={lead?.date ?? ''} as="h1" />
      {lead ? (
        <>
          <div className="news__grid news__grid--page">
            <PostLead p={lead} />
          </div>
          <div className="news__list">
            {rest.map((p) => (
              <PostItem key={p.id} p={p} img />
            ))}
          </div>
        </>
      ) : (
        <p className="news__empty">Скоро здесь появятся первые записи.</p>
      )}
    </div>
  );
}
