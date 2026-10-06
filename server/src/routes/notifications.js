import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();
const DAY = 24 * 60 * 60 * 1000;

function startOfDay(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// GET /api/notifications — role-aware feed computed from live data.
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = getSupabaseAdmin();
    const { data: profile } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', req.user.id)
      .single();
    const role = profile?.role || 'student';
    const items = [];

    if (role === 'admin') {
      const { data: pending } = await db
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'professor')
        .eq('status', 'pending')
        .limit(10);
      for (const p of pending || []) {
        items.push({
          id: `verify-${p.id}`,
          kind: 'verify',
          title: 'Professor verification pending',
          message: `${p.name || p.email} requested a professor account`,
          link: '/admin/users',
          time: null,
        });
      }
    }

    if (role === 'professor' || role === 'admin') {
      const classQuery = db.from('classes').select('id');
      const { data: classes } =
        role === 'admin' ? await classQuery : await classQuery.eq('professor_id', req.user.id);
      const classIds = (classes || []).map(c => c.id);
      if (classIds.length) {
        const { data: tasks } = await db
          .from('tasks')
          .select('id, group_id')
          .in('class_id', classIds);
        const groupIds = [...new Set((tasks || []).map(t => t.group_id).filter(Boolean))];
        if (groupIds.length) {
          const { data: pendingSubs } = await db
            .from('submissions')
            .select('id, submitted_at, tasks!inner(id, title, group_id)')
            .in('tasks.group_id', groupIds)
            .in('status', ['submitted', 'under_review'])
            .order('submitted_at', { ascending: false })
            .limit(10);
          for (const s of pendingSubs || []) {
            items.push({
              id: `review-${s.id}`,
              kind: 'review',
              title: 'Submission awaiting review',
              message: `"${s.tasks?.title || 'A task'}" was submitted by a student`,
              link: `/leader/submissions`,
              time: s.submitted_at,
            });
          }
        }
      }
    }

    if (role === 'student' || role === 'professor') {
      const userId = req.user.id;
      if (role === 'student') {
        const { data: myTasks } = await db
          .from('tasks')
          .select('id, title, deadline, status')
          .eq('assigned_to', userId)
          .not('status', 'in', '(verified,rejected)')
          .order('deadline', { ascending: true });
        const today = startOfDay(new Date());
        for (const t of myTasks || []) {
          const dd = startOfDay(t.deadline);
          if (dd === null) continue;
          const diff = Math.round((dd - today) / DAY);
          if (diff < 0) {
            const when = Math.abs(diff) <= 1 ? 'yesterday' : `${Math.abs(diff)} days ago`;
            items.push({
              id: `overdue-${t.id}`,
              kind: 'overdue',
              title: 'Task overdue',
              message: `"${t.title}" was due ${when}`,
              link: `/student/tasks/${t.id}`,
              time: t.deadline,
            });
          } else if (diff <= 3) {
            const when = diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : `in ${diff} days`;
            items.push({
              id: `due-${t.id}`,
              kind: 'due',
              title: 'Task due soon',
              message: `"${t.title}" is due ${when}`,
              link: `/student/tasks/${t.id}`,
              time: t.deadline,
            });
          }
        }

        const { data: mySubs } = await db
          .from('submissions')
          .select('id, status, submitted_at, tasks!inner(title)')
          .eq('user_id', userId)
          .in('status', ['verified', 'needs_revision', 'rejected'])
          .order('submitted_at', { ascending: false })
          .limit(10);
        for (const s of mySubs || []) {
          const verb = s.status === 'verified' ? 'verified' : s.status === 'rejected' ? 'rejected' : 'needs revision';
          items.push({
            id: `decision-${s.id}`,
            kind: s.status === 'verified' ? 'verified' : 'revision',
            title: `Submission ${verb}`,
            message: `"${s.tasks?.title || 'Your submission'}" was ${verb}`,
            link: `/student/tasks`,
            time: s.submitted_at,
          });
        }
      }

      const { data: ledGroups } = await db
        .from('groups')
        .select('id')
        .eq('leader_id', userId);
      const ledIds = (ledGroups || []).map(g => g.id);
      if (ledIds.length) {
        const { data: pendingSubs } = await db
          .from('submissions')
          .select('id, submitted_at, tasks!inner(id, title, group_id)')
          .in('tasks.group_id', ledIds)
          .in('status', ['submitted', 'under_review'])
          .order('submitted_at', { ascending: false })
          .limit(10);
        for (const s of pendingSubs || []) {
          items.push({
            id: `review-${s.id}`,
            kind: 'review',
            title: 'Submission awaiting your review',
            message: `"${s.tasks?.title || 'A task'}" needs your decision`,
            link: `/leader/submissions?group=${s.tasks?.group_id || ''}`,
            time: s.submitted_at,
          });
        }
      }
    }

    items.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time) - new Date(a.time);
    });

    res.json({ count: items.length, items: items.slice(0, 30) });
  } catch (err) {
    next(err);
  }
});

export default router;
