import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Введите email и пароль' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера при входе' }, { status: 500 });
  }
}
