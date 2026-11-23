import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const [books, totalUsers, reviews, totalShelfItems] = await Promise.all([
    prisma.book.findMany({
      include: {
        _count: {
          select: { reviews: true, libraryItems: true },
        },
      },
      orderBy: { id: 'desc' },
    }),
    prisma.user.count(),
    prisma.review.findMany({ select: { rating: true } }),
    prisma.libraryItem.count(),
  ]);

  const totalBooks = books.length;
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const genreCounts: Record<string, number> = {};
  books.forEach((b) => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
  });

  const genreStats = Object.entries(genreCounts)
    .map(([genre, count]) => ({
      genre,
      count,
      percent: totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const bookRows = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    genre: b.genre,
    publishedYear: b.publishedYear,
    reviewsCount: b._count.reviews,
    shelvesCount: b._count.libraryItems,
  }));

  return (
    <div className="min-h-screen bg-[#f6f6f9] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-900">
                K
              </span>
              <span className="text-xl font-extrabold text-slate-900">Knigi</span>
            </Link>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-amber-300">
              Панель администратора
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
            >
              ← На сайт
            </Link>
            <Link
              href="/library"
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-300 sm:text-sm"
            >
              Моя библиотека
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdminDashboard
          stats={{
            totalBooks,
            totalUsers,
            totalReviews,
            totalShelfItems,
            avgRating,
          }}
          genreStats={genreStats}
          books={bookRows}
        />
      </main>
    </div>
  );
}
