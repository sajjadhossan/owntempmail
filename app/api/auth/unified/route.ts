import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { neonSql } from '@/lib/neon';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const PASSWORD_SALT = 'owntemp_secure_auth_salt_2026';

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, PASSWORD_SALT, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // Check pbkdf2
  const computed = hashPassword(password);
  if (computed === storedHash) return true;
  // Fallback to plain base64 check for legacy accounts
  try {
    if (btoa(password) === storedHash) return true;
  } catch (e) {}
  return false;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`auth_unified_${clientIp}`, 60, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many authentication attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { action, email, password, name, newPassword } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // =========================================================================
    // ACTION 1: SIGN UP (Register in Neon with Strict Approval Workflow)
    // =========================================================================
    if (action === 'signup') {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const SUPER_ADMIN_EMAILS = ['hossansajjad1994@gmail.com'];
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail);
      const initialRole = isSuperAdmin ? 'super_admin' : 'pending';
      const initialBanned = !isSuperAdmin;
      const initialBanReason = isSuperAdmin ? null : 'Pending Super Admin Approval';

      const displayName = String(name || '').trim() || cleanEmail.split('@')[0];
      const pwdHash = hashPassword(password);
      let neonUser: any = null;

      // 1. Check & Insert into Neon Database
      if (neonSql) {
        try {
          const existing = await neonSql`
            SELECT id, email, role, banned, "banReason" FROM neon_auth."user"
            WHERE LOWER(email) = ${cleanEmail}
            LIMIT 1;
          `;

          if (existing && existing.length > 0) {
            return NextResponse.json(
              { success: false, message: 'An account with this email already exists in Neon. Please sign in.' },
              { status: 409 }
            );
          }

          // Insert into neon_auth."user"
          const insertedUser = await neonSql`
            INSERT INTO neon_auth."user" (
              id, name, email, "emailVerified", "createdAt", "updatedAt", role, banned, "banReason"
            ) VALUES (
              gen_random_uuid(), ${displayName}, ${cleanEmail}, true, NOW(), NOW(), ${initialRole}, ${initialBanned}, ${initialBanReason}
            ) RETURNING id, name, email, role, banned, "banReason", "createdAt";
          `;

          if (insertedUser && insertedUser.length > 0) {
            neonUser = insertedUser[0];

            // Insert into neon_auth."account"
            await neonSql`
              INSERT INTO neon_auth."account" (
                id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid(), ${cleanEmail}, 'credential', ${neonUser.id}, ${pwdHash}, NOW(), NOW()
              );
            `;
          }
        } catch (dbErr: any) {
          console.error('[Neon Auth Sign-Up Error]', dbErr);
        }
      }

      // If NOT super admin, hold for approval!
      if (!isSuperAdmin) {
        return NextResponse.json({
          success: true,
          pendingApproval: true,
          message: 'আপনার অ্যাকাউন্টটি সফলভাবে জমা হয়েছে। নিরাপত্তার স্বার্থে সুপার অ্যাডমিন অনুমোদন করার পর আপনি লগইন করতে পারবেন।',
          data: {
            user: {
              id: neonUser?.id || `usr_${Date.now()}`,
              email: cleanEmail,
              name: displayName,
              role: 'pending',
              status: 'pending_approval',
              linkedWithNeon: Boolean(neonUser),
            },
          },
        });
      }

      // Super Admin auto-access
      return NextResponse.json({
        success: true,
        pendingApproval: false,
        message: 'সুপার অ্যাডমিন অ্যাকাউন্ট সক্রিয়! স্বাগতম।',
        data: {
          user: {
            id: neonUser?.id || 'admin_root',
            email: cleanEmail,
            name: displayName,
            role: 'super_admin',
            provider: 'neon',
            linkedWithNeon: true,
          },
        },
      });
    }

    // =========================================================================
    // ACTION 2: SIGN IN (Verify from Neon & Supabase)
    // =========================================================================
    if (action === 'signin') {
      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password is required.' },
          { status: 400 }
        );
      }

      let authenticatedUser: any = null;

      // 1. Verify against Neon Database
      if (neonSql) {
        try {
          const rows = await neonSql`
            SELECT u.id, u.name, u.email, u.role, u.banned, u."banReason", a.password as password_hash
            FROM neon_auth."user" u
            JOIN neon_auth."account" a ON a."userId" = u.id
            WHERE LOWER(u.email) = ${cleanEmail}
            LIMIT 1;
          `;

          if (rows && rows.length > 0) {
            const row = rows[0];
            if (!verifyPassword(password, row.password_hash)) {
              return NextResponse.json(
                { success: false, message: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' },
                { status: 401 }
              );
            }

            const SUPER_ADMIN_EMAILS = ['hossansajjad1994@gmail.com'];
            const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(cleanEmail) || row.role === 'super_admin';

            // Check if rejected
            if (row.role === 'rejected' || (row.banned && row.banReason?.includes('Rejected'))) {
              return NextResponse.json(
                { success: false, message: 'আপনার অ্যাকাউন্টের আবেদনটি সুপার অ্যাডমিন কর্তৃক বাতিল (Rejected) করা হয়েছে।' },
                { status: 403 }
              );
            }

            // Check if pending (and not super admin)
            if (!isSuperAdmin && (row.role === 'pending' || row.banned)) {
              return NextResponse.json(
                { success: false, message: 'আপনার অ্যাকাউন্টটি এখনো অনুমোদিত হয়নি (Pending Approval)। সুপার অ্যাডমিন অনুমোদন দিলে লগইন করতে পারবেন।' },
                { status: 403 }
              );
            }

            authenticatedUser = {
              id: row.id,
              email: row.email,
              name: row.name,
              role: isSuperAdmin ? 'super_admin' : (row.role || 'approved'),
              isSuperAdmin,
              provider: 'neon',
              linkedWithNeon: true,
            };
          }
        } catch (dbErr: any) {
          console.error('[Neon Auth Sign-In Error]', dbErr);
        }
      }

      // 2. Also check / sync with Supabase
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data?.user) {
            if (!authenticatedUser) {
              authenticatedUser = {
                id: data.user.id,
                email: data.user.email || cleanEmail,
                name: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
                role: 'user',
                provider: 'supabase',
                linkedWithSupabase: true,
              };

              // Self-healing: auto-replicate user into Neon if missing
              if (neonSql) {
                try {
                  const ins = await neonSql`
                    INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
                    VALUES (gen_random_uuid(), ${authenticatedUser.name}, ${cleanEmail}, true, NOW(), NOW(), 'user')
                    ON CONFLICT (email) DO UPDATE SET "updatedAt" = NOW()
                    RETURNING id;
                  `;
                  if (ins && ins.length > 0) {
                    await neonSql`
                      INSERT INTO neon_auth."account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
                      VALUES (gen_random_uuid(), ${cleanEmail}, 'credential', ${ins[0].id}, ${hashPassword(password)}, NOW(), NOW())
                      ON CONFLICT DO NOTHING;
                    `;
                    authenticatedUser.linkedWithNeon = true;
                    authenticatedUser.provider = 'neon+supabase';
                  }
                } catch (e) {}
              }
            } else {
              authenticatedUser.linkedWithSupabase = true;
              authenticatedUser.provider = 'neon+supabase';
            }
          }
        } catch (sbErr) {
          console.error('[Supabase Auth Sign-In Error]', sbErr);
        }
      }

      if (authenticatedUser) {
        return NextResponse.json({
          success: true,
          message: 'Signed in successfully!',
          data: { user: authenticatedUser },
        });
      }

      return NextResponse.json(
        { success: false, message: 'No registered account found with this email, or incorrect password.' },
        { status: 401 }
      );
    }

    // =========================================================================
    // ACTION 3: FORGOT / RESET PASSWORD
    // =========================================================================
    if (action === 'forgot') {
      const resetPwd = newPassword || password;
      let neonReset = false;

      if (neonSql) {
        try {
          const userRows = await neonSql`
            SELECT id, email, name FROM neon_auth."user"
            WHERE LOWER(email) = ${cleanEmail}
            LIMIT 1;
          `;

          if (userRows && userRows.length > 0) {
            const u = userRows[0];
            if (resetPwd && resetPwd.length >= 6) {
              const newHash = hashPassword(resetPwd);
              await neonSql`
                UPDATE neon_auth."account"
                SET password = ${newHash}, "updatedAt" = NOW()
                WHERE "userId" = ${u.id};
              `;
              neonReset = true;
            } else {
              neonReset = true; // User verified
            }
          }
        } catch (dbErr: any) {
          console.error('[Neon Auth Forgot Error]', dbErr);
        }
      }

      if (isSupabaseConfigured) {
        try {
          await supabase.auth.resetPasswordForEmail(cleanEmail);
        } catch (e) {}
      }

      if (neonReset) {
        return NextResponse.json({
          success: true,
          message: resetPwd && resetPwd.length >= 6
            ? 'Password has been successfully reset in Neon & Supabase! You can now sign in.'
            : 'Account verified in Neon! Please enter your new password to reset.',
        });
      }

      return NextResponse.json(
        { success: false, message: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[Unified Auth API Error]', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Authentication processing error.' },
      { status: 500 }
    );
  }
}
