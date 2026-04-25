import { supabaseServer } from '@/lib/supabase-server';
import { getMailer, sendEmployeeInviteEmail } from '@/lib/mail';

function supabaseConfigured(): boolean {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
  return Boolean(url && !url.includes('placeholder.supabase.co'));
}

function inviteDuplicateError(err: { message?: string } | null): boolean {
  const m = (err?.message ?? '').toLowerCase();
  return m.includes('already registered') || (m.includes('already') && m.includes('user'));
}

export type InviteDeliveryResult =
  | { ok: true; flow: 'invite' | 'recovery' }
  | { ok: false; error: string };

/**
 * Generates Supabase Auth link and sends login / password-setup email via nodemailer.
 * Used by POST /api/employees (invite on create) and POST /api/employees/[id]/invite.
 */
export async function deliverEmployeeLoginInvite(
  employee: { name: string; email: string | null | undefined; role: string },
  appBaseUrl: string
): Promise<InviteDeliveryResult> {
  const base = appBaseUrl.replace(/\/$/, '');

  if (!getMailer()) {
    return {
      ok: false,
      error:
        'Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER and SMTP_PASS).',
    };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      ok: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY is required on the server to create invite links.',
    };
  }

  if (!supabaseConfigured()) {
    return {
      ok: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL must point to your Supabase project.',
    };
  }

  const email = employee.email?.trim();
  if (!email) {
    return { ok: false, error: 'Add an email address before sending an invite.' };
  }

  if (employee.role === 'worker') {
    return {
      ok: false,
      error: 'The worker role does not use login.',
    };
  }

  // Always land in our callback which routes to signup/login based on flow.
  const redirectTo = `${base}/auth/callback`;
  const userMeta = { full_name: employee.name, app_role: employee.role };

  const inviteRes = await supabaseServer.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
      data: userMeta,
    },
  });

  let actionLink = inviteRes.data?.properties?.action_link;
  let flow: 'invite' | 'recovery' = 'invite';

  if (inviteRes.error || !actionLink) {
    if (inviteRes.error && inviteDuplicateError(inviteRes.error)) {
      const recoveryRes = await supabaseServer.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });
      actionLink = recoveryRes.data?.properties?.action_link;
      flow = 'recovery';
      if (recoveryRes.error || !actionLink) {
        return {
          ok: false,
          error: recoveryRes.error?.message ?? 'Could not generate a password link.',
        };
      }
    } else {
      return {
        ok: false,
        error: inviteRes.error?.message ?? 'Could not generate an invite link.',
      };
    }
  }

  try {
    await sendEmployeeInviteEmail({
      to: email,
      recipientName: employee.name,
      setupLink: actionLink,
      isRecovery: flow === 'recovery',
      dashboardLoginUrl: `${base}/login`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to send email.';
    return { ok: false, error: msg };
  }

  return { ok: true, flow };
}
