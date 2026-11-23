'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookDetailActionsProps {
  bookId: number;
  isLoggedIn: boolean;
  initialStatus: string | null;
}

const STATUS_OPTIONS = [
  { value: 'WANT_TO_READ', label: 'Хочу прочитать' },
  { value: 'READING', label: 'Читаю сейчас' },
  { value: 'FINISHED', label: 'Прочитано' },
];

export default function BookDetailActions({
  bookId,
  isLoggedIn,
  initialStatus,
}: BookDetailActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [savingShelf, setSavingShelf] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [message, setMessage] = useState('');

  async function handleShelfChange(newStatus: string) {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setSavingShelf(true);
    setMessage('');

    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, status: newStatus }),
    });

    if (res.ok) {
      setStatus(newStatus);
      setMessage('Книга сохранена в «Мою библиотеку»!');
      router.refresh();
    }
    setSavingShelf(false);
  }

  async function handleRemoveFromShelf() {
    setSavingShelf(true);
    const res = await fetch(`/api/library?bookId=${bookId}`, { method: 'DELETE' });
    if (res.ok) {
      setStatus(null);
      setMessage('Книга убрана с полки');
      router.refresh();
    }
    setSavingShelf(false);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setMessage('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, rating, comment }),
    });

    if (res.ok) {
      setComment('');
      setRating(5);
      setMessage('Спасибо! Ваш отзыв опубликован.');
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error || 'Не удалось отправить отзыв');
    }
    setSubmittingReview(false);
  }

  return (
    <div className="space-y-8">
      {/* Кнопки личной полки */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Добавить на личную полку
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={savingShelf}
                onClick={() => handleShelfChange(opt.value)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm ${
                  active
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-amber-400'
                }`}
              >
                {active ? `✓ ${opt.label}` : opt.label}
              </button>
            );
          })}
          {status && (
            <button
              type="button"
              disabled={savingShelf}
              onClick={handleRemoveFromShelf}
              className="rounded-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Убрать с полки
            </button>
          )}
        </div>
        {message && <p className="mt-2.5 text-xs font-semibold text-emerald-700">{message}</p>}
      </div>

      {/* Форма нового отзыва */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900">Оставить отзыв и оценку</h3>
        {!isLoggedIn ? (
          <p className="mt-2 text-sm text-slate-600">
            Чтобы поставить оценку и поделиться впечатлением о книге,{' '}
            <Link href="/login" className="font-bold text-amber-600 underline">
              войдите в аккаунт
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
            <div>
              <span className="block text-xs font-bold uppercase text-slate-500">Ваша оценка</span>
              <div className="mt-1.5 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold transition ${
                      star <= rating
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">
                Текст отзыва
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напишите, чем запомнилась книга..."
                className="mt-1.5 w-full rounded-2xl border border-slate-200 p-3.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submittingReview ? 'Публикуем...' : 'Опубликовать отзыв'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
