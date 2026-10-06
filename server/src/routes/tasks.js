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

// PATCH /api/tasks/:id/start — assignee marks the task in progress.
router.patch('/:id/start', requireAuth, async (req, res, next) => {
  try {
    const db = getSupabaseAdmin();
    const { data: task } = await db.from('tasks').select('*').eq('id', req.params.id).single();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Only the assignee can start this task' });
    }
    if (task.status !== 'assigned') {
      return res.status(400).json({ error: `Task is already ${task.status}` });
    }
    const { data: updated } = await db
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', task.id)
      .select()
      .single();
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});
// Tasks assigned to the logged-in user that are overdue or due within 3 days.
// Verified and rejected tasks are excluded.
router.get('/reminders', requireAuth, async (req, res, next) => {
  try {
    const db = getSupabaseAdmin();
    const { data: tasks, error } = await db
      .from('tasks')
      .select('id, title, deadline, status, priority, group_id')
      .eq('assigned_to', req.user.id)
      .not('status', 'in', '(verified,rejected)')
      .order('deadline', { ascending: true });
    if (error) throw error;

    const today = startOfDay(new Date());
    const reminders = (tasks || [])
      .map(t => {
        const deadlineDay = startOfDay(t.deadline);
        if (deadlineDay === null) return null;
        const diffDays = Math.round((deadlineDay - today) / DAY);
        return { ...t, days_left: diffDays, overdue: diffDays < 0 };
      })
      .filter(t => t && t.days_left <= 3);

    res.json({
      overdue: reminders.filter(t => t.overdue),
      due_soon: reminders.filter(t => !t.overdue),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
