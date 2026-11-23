import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import LibraryClient from '@/components/LibraryClient';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const items = await prisma.libraryItem.findMany({
    where: { userId: currentUser.id },
    include: {
      book: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedItems = items.map((item) => ({
    id: item.id,
    status: item.status,
    book: {
      id: item.book.id,
      title: item.book.title,
      author: item.book.author,
      genre: item.book.genre,
      coverUrl: item.book.coverUrl,
      publishedYear: item.book.publishedYear,
    },
  }));

  return (
    <div className="min-h-screen bg-[#f6f6f9] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-900">
              K
            </span>
            <span className="text-xl font-extrabold text-slate-900">Knigi</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
            >
              ← В каталог
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <LibraryClient userName={currentUser.name} initialItems={serializedItems} />
      </main>
    </div>
  );
}
