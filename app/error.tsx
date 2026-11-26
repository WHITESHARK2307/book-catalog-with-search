'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f9] px-4 text-center">
      <h1 className="text-2xl font-black text-slate-900">Что-то пошло не так</h1>
      <p className="mt-2 text-sm text-slate-600">
        Произошла ошибка при загрузке данных. Попробуйте обновить страницу.
      </p>
      <button
        onClick={() => reset()}
        className="mt-5 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-300"
      >
        Попробовать снова
      </button>
    </div>
  );
}
