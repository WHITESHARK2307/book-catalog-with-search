import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password || password.length < 4) {
      return NextResponse.json(
        { error: 'Заполните имя, email и пароль (минимум 4 символа)' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
      },
    });

    await createSession(user.id);
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера при регистрации' }, { status: 500 });
  }
}
