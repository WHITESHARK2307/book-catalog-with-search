'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface BookCardData {
  id: number;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  coverUrl: string;
  audioUrl: string | null;
  avgRating: number;
  reviewsCount: number;
}

interface CatalogViewProps {
  books: BookCardData[];
  currentUser: { id: number; name: string; email: string } | null;
}

const GENRES = [
  'Все',
  'Фантастика',
  'Фэнтези',
  'Детективы',
  'Психология',
  'Бизнес',
  'Классика',
];

export default function CatalogView({ books, currentUser }: CatalogViewProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesGenre =
        selectedGenre === 'Все' ? true : book.genre === selectedGenre;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q);

      return matchesGenre && matchesSearch;
    });
  }, [books, selectedGenre, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f6f6f9] text-slate-900">
      {/* Верхняя шапка */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-900 shadow-sm">
              K
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Knigi
            </span>
          </Link>

          {/* Строка поиска */}
          <div className="order-3 w-full md:order-2 md:max-w-md lg:max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Книга или автор..."
                className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-2 pl-10 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200"
              />
              <span className="pointer-events-none absolute left-3.5 top-2.5 text-slate-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Навигация справа */}
          <nav className="order-2 flex items-center gap-3 md:order-3">
            <Link
              href="/library"
              className="rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
            >
              Моя библиотека
            </Link>
            {currentUser ? (
              <Link
                href="/library"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm"
              >
                {currentUser.name}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 sm:text-sm"
              >
                Войти
              </Link>
            )}
          </nav>
        </div>

        {/* Горизонтальная плашка категорий по жанрам */}
        <div className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
            {GENRES.map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-slate-900'
                    }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Промо-баннер */}
        <section className="mb-8 rounded-3xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-200 p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-slate-900/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
              Каталог книг ({books.length})
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Находите лучшие книги, читайте отзывы и собирайте личную полку
            </h1>
            <p className="mt-2 text-sm text-slate-800 sm:text-base">
              Выбирайте жанр, ищите любимых авторов, ставьте оценки и сохраняйте книги в свою библиотеку.
            </p>
          </div>
        </section>

        {/* Заголовок текущей выборки */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedGenre === 'Все' ? 'Все книги в каталоге' : selectedGenre}
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({filteredBooks.length})
            </span>
          </h2>
        </div>

        {/* Сетка карточек книг */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-700">
              По вашему запросу ничего не найдено
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Попробуйте изменить поисковый запрос или выбрать другую категорию на плашке.
            </p>
            <button
              onClick={() => {
                setSelectedGenre('Все');
                setSearchQuery('');
              }}
              className="mt-4 rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />

                  <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-800 backdrop-blur">
                    {book.genre}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3.5">
                  <div>
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-amber-600">
                      {book.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {book.author}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      ★ {book.avgRating > 0 ? book.avgRating.toFixed(1) : 'Новая'}
                    </span>
                    <span className="text-slate-400">
                      {book.reviewsCount}{' '}
                      {book.reviewsCount === 1
                        ? 'отзыв'
                        : book.reviewsCount >= 2 && book.reviewsCount <= 4
                          ? 'отзыва'
                          : 'отзывов'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
