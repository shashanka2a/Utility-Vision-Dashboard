import nodemailer from 'nodemailer';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/** Returns null if Gmail/SMTP credentials are missing (invite API should return 503). */
export function getMailer(): nodemailer.Transporter | null {
  const user = (
    process.env.GMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ''
  );
  const pass = (
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    ''
  );
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendEmployeeInviteEmail(opts: {
  to: string;
  recipientName: string;
  setupLink: string;
  isRecovery: boolean;
  /** Public dashboard login URL (same app), shown after setup instructions */
  dashboardLoginUrl: string;
}): Promise<void> {
  const transport = getMailer();
  if (!transport) {
    throw new Error('Email transport is not configured (GMAIL_USER / GMAIL_APP_PASSWORD).');
  }

  const from =
    process.env.MAIL_FROM?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    process.env.SMTP_USER ||
    '';

  const subject = opts.isRecovery
    ? 'Reset your Utility Vision password'
    : 'You are invited to Utility Vision — set up your password';

  const safeName = escapeHtml(opts.recipientName || 'there');
  const intro = opts.isRecovery
    ? 'Use the link below to reset your password.'
    : 'You have been added to the Utility Vision team directory. Use the link below to choose a password for your account.';
  const dashboardLine =
    'After you finish setting your password, you can sign in to the Utility Vision dashboard anytime at the address below.';

  const text = [
    `Hi ${opts.recipientName || 'there'},`,
    '',
    intro,
    '',
    opts.setupLink,
    '',
    dashboardLine,
    opts.dashboardLoginUrl,
    '',
    'If you did not expect this message, you can ignore it.',
  ].join('\n');

  const html = `
    <p>Hi ${safeName},</p>
    <p>${escapeHtml(intro)}</p>
    <p><a href="${escapeAttr(opts.setupLink)}">Set up your password</a></p>
    <p>${escapeHtml(dashboardLine)}</p>
    <p><a href="${escapeAttr(opts.dashboardLoginUrl)}">${escapeHtml(opts.dashboardLoginUrl)}</a></p>
    <p style="color:#666;font-size:12px;margin-top:16px">If you did not expect this message, you can ignore it.</p>
  `.trim();

  await transport.sendMail({
    from,
    to: opts.to,
    subject,
    text,
    html,
  });
}
