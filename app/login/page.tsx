'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка входа');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Не удалось подключиться к серверу');
      setLoading(false);
    }
  }

  async function loginAsDemo() {
    setEmail('reader@example.com');
    setPassword('123456');
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@example.com', password: '123456' }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Демо-аккаунт не найден. Выполните npm run db:seed');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f6f9] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-900">
            K
          </span>
          <span className="text-xl font-extrabold text-slate-900">Knigi</span>
        </Link>

        <h1 className="text-2xl font-black text-slate-900">Вход в аккаунт</h1>
        <p className="mt-1 text-sm text-slate-500">
          Войдите, чтобы сохранять книги на полку и оставлять отзывы
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reader@example.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <button
          type="button"
          onClick={loginAsDemo}
          disabled={loading}
          className="mt-3 w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ⚡ Войти как демо-читатель (reader@example.com)
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Ещё нет аккаунта?{' '}
          <Link href="/register" className="font-bold text-slate-900 underline hover:text-amber-600">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
