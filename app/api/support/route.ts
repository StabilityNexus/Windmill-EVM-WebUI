import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_SUBJECT_LEN = 200;
const MAX_DETAILS_LEN = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip CR/LF characters to prevent email header injection.
 * Collapses all internal newlines in single-line fields.
 */
function stripCRLF(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Normalize email: lowercase + trim.
 * Used as the rate-limit key so casing cannot be used to bypass.
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ── POST /api/support ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Parse body ────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const { email, subject, details } = body as Record<string, unknown>;

  // ── 2. Server-side validation ────────────────────────────────────────────
  if (typeof email !== 'string' || typeof subject !== 'string' || typeof details !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'All fields are required.' },
      { status: 400 },
    );
  }

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid email address.' },
      { status: 400 },
    );
  }

  const cleanSubject = stripCRLF(subject);
  const cleanDetails = details.replace(/\r\n/g, '\n').trim();

  if (!cleanSubject || cleanSubject.length > MAX_SUBJECT_LEN) {
    return NextResponse.json(
      { ok: false, error: `Subject must be 1–${MAX_SUBJECT_LEN} characters.` },
      { status: 400 },
    );
  }

  if (!cleanDetails || cleanDetails.length > MAX_DETAILS_LEN) {
    return NextResponse.json(
      { ok: false, error: `Details must be 1–${MAX_DETAILS_LEN} characters.` },
      { status: 400 },
    );
  }

  // ── 3. Rate limit (FAIL CLOSED) ──────────────────────────────────────────
  //
  // The rate limiter MUST succeed before any email is sent.
  // If Upstash is unconfigured or unreachable, we return 503 rather than
  // letting the submission through. This is intentional: the 10/24h limit
  // is a hard requirement, not a best-effort one.
  //
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    console.error('[support/route] Upstash env vars missing — ticket submission blocked.');
    return NextResponse.json(
      { ok: false, error: 'Ticket submission is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  try {
    const redis = new Redis({ url: upstashUrl, token: upstashToken });

    const ratelimit = new Ratelimit({
      redis,
      // Sliding window: 10 submissions per email per 24 hours.
      limiter: Ratelimit.slidingWindow(10, '24 h'),
      // Prefix isolates our keys from any other Upstash usage.
      prefix: 'windmill:support',
    });

    const { success, remaining } = await ratelimit.limit(normalizedEmail);

    if (!success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'You have reached the maximum of 10 support tickets per 24 hours. Please try again later.',
          remaining: 0,
        },
        { status: 429 },
      );
    }

    // remaining available for logging but not exposed to the client
    void remaining;
  } catch (err) {
    // Any error talking to Upstash → fail closed, do NOT send the email.
    console.error('[support/route] Rate-limit check failed:', err);
    return NextResponse.json(
      { ok: false, error: 'Ticket submission is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  // ── 4. Send email via Resend ─────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.SUPPORT_FROM_EMAIL;
  const toEmail = process.env.SUPPORT_TO_EMAIL;

  if (!resendKey || !fromEmail || !toEmail) {
    console.error('[support/route] Resend env vars missing — cannot send email.');
    return NextResponse.json(
      { ok: false, error: 'Ticket submission is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: normalizedEmail,
      subject: `[Support Ticket] ${cleanSubject}`,
      text: [
        `From: ${normalizedEmail}`,
        `Subject: ${cleanSubject}`,
        '',
        cleanDetails,
      ].join('\n'),
    });

    if (error) {
      // Log the Resend error server-side but never surface raw provider errors to client.
      console.error('[support/route] Resend error:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to send ticket. Please try again later.' },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error('[support/route] Unexpected error sending email:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to send ticket. Please try again later.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
