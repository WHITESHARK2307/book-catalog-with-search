export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f9] px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-slate-900" />
      <p className="mt-4 text-sm font-bold text-slate-700">Загружаем каталог книг...</p>
    </div>
  );
}
