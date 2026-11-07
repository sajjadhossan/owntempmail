import { NextRequest, NextResponse } from 'next/server';
import { neonSql } from '@/lib/neon';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const SUPER_ADMIN_EMAILS = ['hossansajjad1994@gmail.com'];

async function verifyIsAdmin(adminIdOrEmail: string): Promise<boolean> {
  if (!adminIdOrEmail || !neonSql) return false;
  const clean = adminIdOrEmail.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(clean)) return true;

  try {
    const rows = await neonSql`
      SELECT id, email, role FROM neon_auth."user"
      WHERE (id::text = ${clean} OR LOWER(email) = ${clean})
      LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      const r = rows[0].role;
      return r === 'super_admin' || r === 'admin';
    }
  } catch (e) {
    console.error('[Verify Admin Error]', e);
  }
  return false;
}

// GET: Retrieve all users for the Super Admin Approval Desk
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requester = searchParams.get('requester') || '';

  const isAdmin = await verifyIsAdmin(requester);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Super Admin access required.' },
      { status: 403 }
    );
  }

  if (!neonSql) {
    return NextResponse.json(
      { success: false, message: 'Neon Database connection is not available.' },
      { status: 500 }
    );
  }

  try {
    const users = await neonSql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        banned, 
        "banReason", 
        "createdAt", 
        "updatedAt"
      FROM neon_auth."user"
      ORDER BY "createdAt" DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        users: users || [],
        total: users ? users.length : 0,
        pendingCount: users ? users.filter((u: any) => u.role === 'pending' || (u.banned && u.banReason?.includes('Pending'))).length : 0,
      },
    });
  } catch (err: any) {
    console.error('[Admin Users GET Error]', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch users from Neon.' },
      { status: 500 }
    );
  }
}

// POST: Approve, Reject, Promote or Delete user
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`admin_action_${clientIp}`, 60, 60);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { requester, action, targetUserId, targetEmail } = body;

    const isAdmin = await verifyIsAdmin(requester);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Super Admin access required.' },
        { status: 403 }
      );
    }

    if (!neonSql) {
      return NextResponse.json(
        { success: false, message: 'Neon Database connection is not available.' },
        { status: 500 }
      );
    }

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { success: false, message: 'targetUserId or targetEmail is required.' },
        { status: 400 }
      );
    }

    // 1. APPROVE USER
    if (action === 'approve') {
      await neonSql`
        UPDATE neon_auth."user"
        SET 
          role = 'approved',
          banned = false,
          "banReason" = null,
          "updatedAt" = NOW()
        WHERE (id::text = ${targetUserId} OR LOWER(email) = ${targetEmail?.toLowerCase()});
      `;

      return NextResponse.json({
        success: true,
        message: 'ব্যবহারকারী সফলভাবে অনুমোদিত (Approved) হয়েছে! তিনি এখন অ্যাপে প্রবেশ করতে পারবেন।',
      });
    }

    // 2. REJECT USER
    if (action === 'reject') {
      await neonSql`
        UPDATE neon_auth."user"
        SET 
          role = 'rejected',
          banned = true,
          "banReason" = 'Rejected by Super Admin',
          "updatedAt" = NOW()
        WHERE (id::text = ${targetUserId} OR LOWER(email) = ${targetEmail?.toLowerCase()});
      `;

      return NextResponse.json({
        success: true,
        message: 'ব্যবহারকারীর আবেদন বাতিল (Rejected) করা হয়েছে।',
      });
    }

    // 3. PROMOTE TO ADMIN
    if (action === 'make_admin') {
      await neonSql`
        UPDATE neon_auth."user"
        SET 
          role = 'admin',
          banned = false,
          "banReason" = null,
          "updatedAt" = NOW()
        WHERE (id::text = ${targetUserId} OR LOWER(email) = ${targetEmail?.toLowerCase()});
      `;

      return NextResponse.json({
        success: true,
        message: 'ব্যবহারকারীকে সফলভাবে অ্যাডমিন (Admin) মর্যাদা দেওয়া হয়েছে।',
      });
    }

    // 4. DELETE USER
    if (action === 'delete') {
      // Find userId
      const u = await neonSql`
        SELECT id FROM neon_auth."user"
        WHERE (id::text = ${targetUserId} OR LOWER(email) = ${targetEmail?.toLowerCase()})
        LIMIT 1;
      `;

      if (u && u.length > 0) {
        const uid = u[0].id;
        await neonSql`DELETE FROM neon_auth."account" WHERE "userId" = ${uid};`;
        await neonSql`DELETE FROM neon_auth."session" WHERE "userId" = ${uid};`;
        await neonSql`DELETE FROM neon_auth."user" WHERE id = ${uid};`;
      }

      return NextResponse.json({
        success: true,
        message: 'ব্যবহারকারী সম্পূর্ণ মুছে ফেলা হয়েছে।',
      });
    }

    return NextResponse.json(
      { success: false, message: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[Admin Action Error]', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Admin operation failed.' },
      { status: 500 }
    );
  }
}
