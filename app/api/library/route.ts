import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });
  }

  try {
    const { bookId, status } = await req.json();
    const numericBookId = Number(bookId);

    const item = await prisma.libraryItem.upsert({
      where: {
        userId_bookId: { userId: user.id, bookId: numericBookId },
      },
      update: { status: status || 'WANT_TO_READ' },
      create: {
        userId: user.id,
        bookId: numericBookId,
        status: status || 'WANT_TO_READ',
      },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Ошибка обновления полки' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Войдите в аккаунт' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const bookId = Number(searchParams.get('bookId'));

    await prisma.libraryItem.delete({
      where: {
        userId_bookId: { userId: user.id, bookId },
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления из библиотеки' }, { status: 500 });
  }
}
