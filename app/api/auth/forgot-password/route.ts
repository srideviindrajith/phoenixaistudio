import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email belongs to an administrator
        const admin = await prisma.admin.findUnique({
            where: { email: normalizedEmail },
        });

        if (admin) {
            // Generate a secure reset token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

            // Clean up any stale reset tokens for this email first (ensuring one-time token use)
            await prisma.passwordResetToken.deleteMany({
                where: { email: normalizedEmail },
            });

            // Persist the secure token in the database
            await prisma.passwordResetToken.create({
                data: {
                    email: normalizedEmail,
                    token,
                    expiresAt,
                },
            });

            // Get base request origin
            const origin = request.headers.get('origin') || request.nextUrl.origin || 'http://localhost:3000';
            const resetLink = `${origin}/admin/reset-password?token=${token}`;

            // Log reset link locally for development fallback visibility
            console.log(`[SECURITY INFO] Generated Password Reset Link for ${normalizedEmail}:\n${resetLink}`);

            // Configure nodemailer transport with fallback
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;

            if (emailUser && emailPass) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                });

                try {
                    await transporter.sendMail({
                        from: `"PhoenixAI Studio Portal" <${emailUser}>`,
                        to: normalizedEmail,
                        subject: 'PhoenixAI Studio Admin Password Reset',
                        html: `
                            <div style="background-color: #050505; color: #ffffff; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid rgba(255, 106, 0, 0.2); max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #FF7A00; border-bottom: 1px solid rgba(255, 106, 0, 0.2); padding-bottom: 10px;">PhoenixAI Studio Secure Password Reset</h2>
                                <p>You requested a password reset for your administrator account.</p>
                                <p>Please click the button below to reset your password. This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
                                <div style="margin: 24px 0;">
                                    <a href="${resetLink}" style="background: linear-gradient(135deg, #FF7A00 0%, #FF9F1A 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; display: inline-block;">
                                        Reset Password
                                    </a>
                                </div>
                                <p style="color: #a1a1aa; font-size: 12px;">If you did not request this email, please disregard it immediately.</p>
                                <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 20px 0;" />
                                <p style="font-size: 11px; color: #71717a; text-align: center;">© 2026 PhoenixAI Studio. Secure Admin Access Only.</p>
                            </div>
                        `,
                    });
                    console.log(`[SMTP] Reset email successfully dispatched to ${normalizedEmail}.`);
                } catch (smtpError) {
                    console.error('[SMTP ERROR] Failed to send email via Nodemailer:', smtpError);
                }
            } else {
                console.warn('[SMTP WARNING] EMAIL_USER and EMAIL_PASS environment variables are not defined. Reset email was not dispatched via SMTP.');
            }
        }

        // Generic response to prevent user enumeration
        return NextResponse.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('[FORGOT PASSWORD SYSTEM ERROR]:', error);
        return NextResponse.json({ error: 'Failed to process forgot password request.' }, { status: 500 });
    }
}
