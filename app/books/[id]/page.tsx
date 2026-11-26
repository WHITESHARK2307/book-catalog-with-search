import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import BookDetailActions from '@/components/BookDetailActions';
import Image from 'next/image';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id: Number(id) } });
  if (!book) {
    return {
      title: 'Книга не найдена — Каталог книг Knigi',
      description: 'Запрашиваемая книга отсутствует в каталоге сервиса Knigi.',
    };
  }
  return {
    title: `${book.title} — ${book.author} | Каталог Knigi`,
    description: book.description.slice(0, 155),
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);
  if (Number.isNaN(bookId)) notFound();

  const [book, currentUser] = await Promise.all([
    prisma.book.findUnique({
      where: { id: bookId },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!book) notFound();

  const libraryItem = currentUser
    ? await prisma.libraryItem.findUnique({
        where: {
          userId_bookId: { userId: currentUser.id, bookId: book.id },
        },
      })
    : null;

  const reviewsCount = book.reviews.length;
  const avgRating =
    reviewsCount > 0
      ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

    const litresBase = 'https://' + 'www.litres.ru/search/?q=';
    const litresSearchUrl = `${litresBase}${encodeURIComponent(
    `${book.title} ${book.author}`
  )}`;


  return (
    <div className="min-h-screen bg-[#f6f6f9] text-slate-900">
      {/* Шапка */}
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
            <Link
              href="/library"
              className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-300 sm:text-sm"
            >
              Моя библиотека
            </Link>
          </div>
        </div>
      </header>

      {/* Карточка книги */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[260px_1fr] md:p-8">
          {/* Обложка */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={400}
                height={600}
                className="aspect-2/3 w-full object-cover"
              />
            </div>
          </div>

          {/* Информация и описание */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  {book.genre}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {book.publishedYear} г.
                </span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-amber-300">
                  ★ {avgRating > 0 ? avgRating.toFixed(1) : 'Нет оценок'} ({reviewsCount})
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {book.title}
              </h1>
              <p className="mt-1 text-base font-semibold text-slate-500">{book.author}</p>

              {/* Описание (аннотация) */}
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  О книге
                </h2>
                <p className="mt-2 leading-relaxed text-slate-700">{book.description}</p>
              </div>

              {/* Плашка перехода на Литрес */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-linear-to-r from-orange-50 to-amber-50 px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    Полная версия книги
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    Читать фрагмент или приобрести электронную версию на Литрес
                  </p>
                </div>
                <a
                  href={litresSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 sm:text-sm"
                >
                  Перейти на Литрес ↗
                </a>
              </div>
            </div>

            <BookDetailActions
              bookId={book.id}
              isLoggedIn={Boolean(currentUser)}
              initialStatus={libraryItem?.status || null}
            />
          </div>
        </div>

        {/* Список отзывов */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-extrabold text-slate-900">
            Отзывы читателей ({reviewsCount})
          </h2>

          {book.reviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              На эту книгу ещё нет отзывов — станьте первым!
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {book.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{review.user.name}</span>
                    <span className="rounded-lg bg-amber-400/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-700">
                      {'★'.repeat(review.rating)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
