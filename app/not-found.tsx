import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f9] px-4 text-center">
      <span className="rounded-2xl bg-amber-400 px-4 py-1.5 text-sm font-black text-slate-900">
        Ошибка 404
      </span>
      <h1 className="mt-4 text-3xl font-black text-slate-900">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Возможно, книга была удалена из каталога или ссылка введена с опечаткой.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Вернуться в каталог книг
      </Link>
    </div>
  );
}
