import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import CatalogView, { BookCardData } from '@/components/CatalogView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Knigi — Каталог книг с живым поиском и отзывами',
  description: 'Ищите книги по автору и названию, выбирайте жанры, читайте рецензии и собирайте личную библиотеку.',
};

export default async function HomePage() {
  const [booksFromDb, currentUser] = await Promise.all([
    prisma.book.findMany({
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { id: 'asc' },
    }),
    getCurrentUser(),
  ]);

  const books: BookCardData[] = booksFromDb.map((book) => {
    const reviewsCount = book.reviews.length;
    const avgRating =
      reviewsCount > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
        : 0;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      publishedYear: book.publishedYear,
      coverUrl: book.coverUrl,
      audioUrl: book.audioUrl,
      avgRating,
      reviewsCount,
    };
  });

  return <CatalogView books={books} currentUser={currentUser} />;
}
