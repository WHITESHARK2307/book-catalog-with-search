'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LibraryEntry {
  id: number;
  status: string;
  book: {
    id: number;
    title: string;
    author: string;
    genre: string;
    coverUrl: string;
    publishedYear: number;
  };
}

const TABS = [
  { key: 'ALL', label: 'Все книги' },
  { key: 'READING', label: 'Читаю сейчас' },
  { key: 'WANT_TO_READ', label: 'Хочу прочитать' },
  { key: 'FINISHED', label: 'Прочитано' },
];

export default function LibraryClient({
  userName,
  initialItems,
}: {
  userName: string;
  initialItems: LibraryEntry[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState('ALL');

  const visibleItems =
    activeTab === 'ALL' ? items : items.filter((item) => item.status === activeTab);

  async function updateStatus(bookId: number, status: string) {
    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, status }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((it) => (it.book.id === bookId ? { ...it, status } : it))
      );
      router.refresh();
    }
  }

  async function removeBook(bookId: number) {
    const res = await fetch(`/api/library?bookId=${bookId}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((it) => it.book.id !== bookId));
      router.refresh();
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Моя библиотека</h1>
          <p className="mt-1 text-sm text-slate-500">
            Читатель: <span className="font-bold text-slate-800">{userName}</span> • Книг на полке: {items.length}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          Выйти из аккаунта
        </button>
      </div>

      {/* Вкладки полок */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-amber-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-bold text-slate-700">На этой полке пока пусто</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-slate-900 hover:bg-amber-300"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map(({ id, status, book }) => (
            <div
              key={id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Link href={`/books/${book.id}`} className="shrink-0">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-32 w-22 rounded-xl object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-600">{book.genre}</span>
                  <Link
                    href={`/books/${book.id}`}
                    className="mt-0.5 line-clamp-2 block text-sm font-bold text-slate-900 hover:text-amber-600"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-slate-500">{book.author}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <select
                    value={status}
                    onChange={(e) => updateStatus(book.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-amber-400"
                  >
                    <option value="WANT_TO_READ">Хочу прочитать</option>
                    <option value="READING">Читаю сейчас</option>
                    <option value="FINISHED">Прочитано</option>
                  </select>

                  <button
                    onClick={() => removeBook(book.id)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
