import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();

const REVIEW_ACTIONS = ['verified', 'needs_revision', 'rejected'];

async function canReview(db, userId, task) {
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (profile?.role === 'admin') return true;

  const { data: group } = await db
    .from('groups')
    .select('id, leader_id, class_id')
    .eq('id', task.group_id)
    .single();
  if (group?.leader_id === userId) return true;

  if (task.class_id) {
    const { data: cls } = await db
      .from('classes')
      .select('professor_id')
      .eq('id', task.class_id)
      .single();
    if (cls?.professor_id === userId) return true;
  }
  return false;
}

// POST /api/submissions  { task_id, files, comment }
// Creates a submission for the assignee and marks the task submitted.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { task_id: taskId, files = [], comment = '' } = req.body || {};
    if (!taskId) return res.status(400).json({ error: 'task_id is required' });

    const db = getSupabaseAdmin();
    const { data: task } = await db.from('tasks').select('*').eq('id', taskId).single();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Only the assignee can submit this task' });
    }

    const { data: submission, error: subError } = await db
      .from('submissions')
      .insert({ task_id: taskId, user_id: req.user.id, files, comment, status: 'submitted' })
      .select()
      .single();
    if (subError) throw subError;

    await db.from('tasks').update({ status: 'submitted' }).eq('id', taskId);

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:id/file?path=<storage path>
// Returns a short-lived signed URL. Allowed for the owner or a reviewer.
router.get('/:id/file', requireAuth, async (req, res, next) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'path is required' });

    const db = getSupabaseAdmin();
    const { data: submission } = await db
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const listed = (submission.files || [])
      .map(f => (typeof f === 'string' ? null : f?.path))
      .filter(Boolean);
    if (!listed.includes(filePath)) return res.status(403).json({ error: 'File not part of this submission' });

    const isOwner = submission.user_id === req.user.id;
    let allowed = isOwner;
    if (!allowed) {
      const { data: task } = await db.from('tasks').select('*').eq('id', submission.task_id).single();
      allowed = task ? await canReview(db, req.user.id, task) : false;
    }
    if (!allowed) return res.status(403).json({ error: 'Not allowed to view this file' });

    const { data, error } = await db.storage.from('submissions').createSignedUrl(filePath, 3600);
    if (error) throw error;
    res.json({ url: data.signedUrl });
  } catch (err) {
    next(err);
  }
});
router.patch('/:id/review', requireAuth, async (req, res, next) => {
  try {
    const { action } = req.body || {};
    if (!REVIEW_ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'action must be verified, needs_revision, or rejected' });
    }

    const db = getSupabaseAdmin();
    const { data: submission } = await db
      .from('submissions')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    const { data: task } = await db.from('tasks').select('*').eq('id', submission.task_id).single();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (!(await canReview(db, req.user.id, task))) {
      return res.status(403).json({ error: 'Only the group leader or professor can review' });
    }

    const { data: updated } = await db
      .from('submissions')
      .update({ status: action })
      .eq('id', submission.id)
      .select()
      .single();

    const taskUpdate =
      action === 'verified'
        ? { status: 'verified', progress: 100 }
        : action === 'needs_revision'
          ? { status: 'in_progress' }
          : { status: 'assigned' };
    await db.from('tasks').update(taskUpdate).eq('id', task.id);

    // Roll progress up: task average -> group -> project
    if (task.group_id) {
      const { data: groupTasks } = await db
        .from('tasks')
        .select('progress')
        .eq('group_id', task.group_id);
      if (groupTasks?.length) {
        const avg = Math.round(groupTasks.reduce((a, t) => a + (t.progress || 0), 0) / groupTasks.length);
        await db.from('groups').update({ progress: avg }).eq('id', task.group_id);
      }
    }
    if (task.project_id) {
      const { data: projectTasks } = await db
        .from('tasks')
        .select('progress')
        .eq('project_id', task.project_id);
      if (projectTasks?.length) {
        const avg = Math.round(projectTasks.reduce((a, t) => a + (t.progress || 0), 0) / projectTasks.length);
        await db.from('projects').update({ overall_progress: avg }).eq('id', task.project_id);
      }
    }

    res.json({ submission: updated, task_id: task.id, class_id: task.class_id });
  } catch (err) {
    next(err);
  }
});

export default router;
