import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Войдите в аккаунт, чтобы оставить отзыв' }, { status: 401 });
  }

  try {
    const { bookId, rating, comment } = await req.json();
    const numericBookId = Number(bookId);
    const numericRating = Number(rating);

    if (!numericBookId || numericRating < 1 || numericRating > 5 || !comment?.trim()) {
      return NextResponse.json({ error: 'Укажите оценку от 1 до 5 и текст отзыва' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bookId: numericBookId,
        userId: user.id,
        rating: numericRating,
        comment: comment.trim(),
      },
    });

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: 'Ошибка сохранения отзыва' }, { status: 500 });
  }
}
