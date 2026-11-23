import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const GENRE_COVERS: Record<string, string> = {
  'Фантастика': '/covers/cover-1.svg',
  'Фэнтези': '/covers/cover-2.svg',
  'Детективы': '/covers/cover-3.svg',
  'Психология': '/covers/cover-4.svg',
  'Бизнес': '/covers/cover-5.svg',
  'Классика': '/covers/cover-6.svg',
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });
  }

  try {
    const { title, author, genre, publishedYear, description, coverUrl } = await req.json();

    if (!title?.trim() || !author?.trim() || !genre?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    const finalCover = coverUrl?.trim() || GENRE_COVERS[genre] || '/covers/cover-1.svg';

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        publishedYear: Number(publishedYear) || new Date().getFullYear(),
        description: description.trim(),
        coverUrl: finalCover,
        audioUrl: null,
        content: description.trim(),
      },
    });

    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: 'Ошибка добавления книги' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'Не указан ID книги' }, { status: 400 });
    }

    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления книги' }, { status: 500 });
  }
}
