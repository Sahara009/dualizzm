import { notFound } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { getPostById } from '@/lib/db';

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') {
    return (
      <div className="adm__main">
        <h1>Новая запись</h1>
        <PostForm post={null} />
      </div>
    );
  }
  const post = getPostById(Number(id));
  if (!post) notFound();
  return (
    <div className="adm__main">
      <h1>{post.title}</h1>
      <PostForm post={post} />
    </div>
  );
}
