import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid token.' }, { status: 400 });
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
        }

        // Search for the reset token in the database
        const resetRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetRecord) {
            return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
        }

        // Validate expiration (15 minutes limit)
        const isExpired = new Date() > resetRecord.expiresAt;
        if (isExpired) {
            // Delete expired token to keep DB clean
            await prisma.passwordResetToken.delete({
                where: { token },
            }).catch(() => {});
            return NextResponse.json({ error: 'This reset token has expired. Please request a new link.' }, { status: 400 });
        }

        // Hash the new password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the admin user record matching the email from the token
        await prisma.admin.update({
            where: { email: resetRecord.email },
            data: { password: hashedPassword },
        });

        // Delete the used token immediately to prevent one-time bypass reuse
        await prisma.passwordResetToken.delete({
            where: { token },
        }).catch(() => {});

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        console.error('[RESET PASSWORD SYSTEM ERROR]:', error);
        return NextResponse.json({ error: 'Failed to reset password. Please try again later.' }, { status: 500 });
    }
}
