import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();

function toDay(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// POST /api/contributions/recalculate  { class_id }
// Recomputes tasks_assigned / tasks_completed / on_time_completions /
// contribution_percent for every member of the class.
router.post('/recalculate', requireAuth, async (req, res, next) => {
  try {
    const { class_id: classId } = req.body || {};
    if (!classId) return res.status(400).json({ error: 'class_id is required' });

    const db = getSupabaseAdmin();

    const { data: profile } = await db
      .from('profiles')
      .select('id, role')
      .eq('id', req.user.id)
      .single();

    const { data: cls } = await db
      .from('classes')
      .select('id, professor_id')
      .eq('id', classId)
      .single();
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    let authorized = profile?.role === 'admin' || cls.professor_id === req.user.id;
    if (!authorized) {
      const { data: led } = await db
        .from('groups')
        .select('id')
        .eq('class_id', classId)
        .eq('leader_id', req.user.id)
        .limit(1);
      authorized = (led || []).length > 0;
    }
    if (!authorized) return res.status(403).json({ error: 'Not allowed for this class' });

    const { data: tasks, error: tasksError } = await db
      .from('tasks')
      .select('id, assigned_to, status, deadline')
      .eq('class_id', classId);
    if (tasksError) throw tasksError;

    const taskIds = (tasks || []).map(t => t.id);
    let submissions = [];
    if (taskIds.length > 0) {
      const { data: subs, error: subsError } = await db
        .from('submissions')
        .select('task_id, submitted_at')
        .in('task_id', taskIds);
      if (subsError) throw subsError;
      submissions = subs || [];
    }
    const subsByTask = new Map();
    for (const s of submissions) {
      if (!subsByTask.has(s.task_id)) subsByTask.set(s.task_id, []);
      subsByTask.get(s.task_id).push(s);
    }

    const byUser = new Map();
    for (const t of tasks || []) {
      if (!t.assigned_to) continue;
      if (!byUser.has(t.assigned_to)) byUser.set(t.assigned_to, { assigned: 0, completed: 0, onTime: 0 });
      const row = byUser.get(t.assigned_to);
      row.assigned += 1;
      if (t.status === 'verified') {
        row.completed += 1;
        const deadlineDay = toDay(t.deadline);
        const onTime = (subsByTask.get(t.id) || []).some(s => {
          const submittedDay = toDay(s.submitted_at);
          return submittedDay !== null && deadlineDay !== null && submittedDay <= deadlineDay;
        });
        if (onTime) row.onTime += 1;
      }
    }

    const userIds = [...byUser.keys()];
    const [{ data: memberProfiles }, { data: memberGroups }] = await Promise.all([
      db.from('profiles').select('id, name, avatar').in('id', userIds),
      db.from('group_members').select('user_id, group_id, groups!inner(class_id)').eq('groups.class_id', classId),
    ]);
    const profileById = new Map((memberProfiles || []).map(p => [p.id, p]));
    const groupByUser = new Map();
    for (const m of memberGroups || []) {
      if (!groupByUser.has(m.user_id)) groupByUser.set(m.user_id, m.group_id);
    }

    const rows = [...byUser.entries()]
      .filter(([userId]) => groupByUser.has(userId))
      .map(([userId, r]) => ({
        user_id: userId,
        user_name: profileById.get(userId)?.name || 'Member',
        avatar: profileById.get(userId)?.avatar || null,
        group_id: groupByUser.get(userId),
        class_id: classId,
        tasks_assigned: r.assigned,
        tasks_completed: r.completed,
        contribution_percent: r.assigned ? Math.round((r.completed / r.assigned) * 100) : 0,
        on_time_completions: r.onTime,
      }));

    if (rows.length > 0) {
      const { error: upsertError } = await db
        .from('contributions')
        .upsert(rows, { onConflict: 'user_id,class_id' });
      if (upsertError) throw upsertError;
    }

    res.json({ class_id: classId, updated: rows.length, rows });
  } catch (err) {
    next(err);
  }
});

export default router;
