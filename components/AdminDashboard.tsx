'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookRow {
  id: number;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  reviewsCount: number;
  shelvesCount: number;
}

interface GenreStat {
  genre: string;
  count: number;
  percent: number;
}

interface AdminDashboardProps {
  stats: {
    totalBooks: number;
    totalUsers: number;
    totalReviews: number;
    totalShelfItems: number;
    avgRating: number;
  };
  genreStats: GenreStat[];
  books: BookRow[];
}

const GENRES = ['Фантастика', 'Фэнтези', 'Детективы', 'Психология', 'Бизнес', 'Классика'];

export default function AdminDashboard({ stats, genreStats, books }: AdminDashboardProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Фантастика');
  const [publishedYear, setPublishedYear] = useState('2024');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, genre, publishedYear, description }),
    });

    if (res.ok) {
      setTitle('');
      setAuthor('');
      setDescription('');
      setMessage('Книга успешно добавлена в каталог!');
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error || 'Ошибка при добавлении');
    }
    setSubmitting(false);
  }

  async function handleDeleteBook(id: number, bookTitle: string) {
    if (!confirm(`Удалить книгу «${bookTitle}» из базы данных?`)) return;

    const res = await fetch(`/api/books?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
  }
  return (
    <div className="space-y-8">
      {/* Верхние карточки метрик */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Всего книг</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalBooks}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Читателей</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalUsers}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Отзывов</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalReviews}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">На полках</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{stats.totalShelfItems}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-amber-800">Средний рейтинг</p>
          <p className="mt-2 text-3xl font-black text-amber-600">
            ★ {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {/* Аналитика по жанрам + Форма добавления книги */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Распределение книг по жанрам</h2>
          <p className="mt-1 text-xs text-slate-500">Аналитика наполнения базы SQLite</p>

          <div className="mt-6 space-y-4">
            {genreStats.map((g) => (
              <div key={g.genre}>
                <div className="mb-1 flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{g.genre}</span>
                  <span className="text-slate-500">
                    {g.count} шт. ({g.percent}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">+ Добавить новую книгу</h2>
          <p className="mt-1 text-xs text-slate-500">
            Обложка подставится автоматически под выбранный жанр
          </p>

          {message && (
            <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={handleAddBook} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название книги"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-amber-400"
              />
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Автор"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-400"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <input
                type="number"
                required
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                placeholder="Год издания"
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание (аннотация)..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Сохраняем...' : 'Сохранить в каталог'}
            </button>
          </form>
        </div>
      </div>

      {/* Таблица управления книгами */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            Управление каталогом ({books.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Название и автор</th>
                <th className="px-6 py-3">Жанр</th>
                <th className="px-6 py-3">Отзывы</th>
                <th className="px-6 py-3">На полках</th>
                <th className="px-6 py-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">#{book.id}</td>
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/books/${book.id}`}
                      className="font-bold text-slate-900 hover:text-amber-600"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {book.author} ({book.publishedYear})
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {book.genre}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{book.reviewsCount}</td>
                  <td className="px-6 py-3.5 text-slate-600">{book.shelvesCount}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
