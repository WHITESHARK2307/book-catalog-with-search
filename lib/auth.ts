import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from './prisma';

const SESSION_COOKIE = 'knigi_session';

export function hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createSession(userId: number) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, String(userId), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    if (!session?.value) return null;

    const userId = Number(session.value);
    if (Number.isNaN(userId)) return null;

    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
    });
}
