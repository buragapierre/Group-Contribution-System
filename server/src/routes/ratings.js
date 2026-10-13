import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();

async function getGroup(db, groupId) {
  const { data } = await db.from('groups').select('id, class_id, leader_id').eq('id', groupId).single();
  return data || null;
}

async function canView(db, userId, role, group) {
  if (role === 'admin') return true;
  if (group.leader_id === userId) return true;
  if (group.class_id) {
    const { data: cls } = await db.from('classes').select('professor_id').eq('id', group.class_id).single();
    if (cls?.professor_id === userId) return true;
  }
  const { data: membership } = await db
    .from('group_members')
    .select('user_id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .limit(1);
  return (membership || []).length > 0;
}

// GET /api/ratings?group_id=<id>  or  ?class_id=<id>
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = getSupabaseAdmin();
    const { data: profile } = await db.from('profiles').select('role').eq('id', req.user.id).single();
    const role = profile?.role || 'student';

    if (req.query.group_id) {
      const group = await getGroup(db, req.query.group_id);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      if (!(await canView(db, req.user.id, role, group))) return res.status(403).json({ error: 'Not allowed' });
      const { data, error } = await db.from('ratings').select('*').eq('group_id', group.id);
      if (error) throw error;
      return res.json({ ratings: data || [] });
    }

    if (req.query.class_id) {
      const { data: groups } = await db.from('groups').select('id, class_id, leader_id').eq('class_id', req.query.class_id);
      const ids = (groups || []).map(g => g.id);
      if (!ids.length) return res.json({ ratings: [] });
      const first = groups[0];
      if (!(await canView(db, req.user.id, role, first))) return res.status(403).json({ error: 'Not allowed' });
      const { data, error } = await db.from('ratings').select('*').in('group_id', ids);
      if (error) throw error;
      return res.json({ ratings: data || [] });
    }

    return res.status(400).json({ error: 'group_id or class_id is required' });
  } catch (err) {
    next(err);
  }
});

// POST /api/ratings  { group_id, rated_user_id, score, comment }
// Leader grades a member (0-100). One rating per member per group.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { group_id: groupId, rated_user_id: ratedUserId, score, comment = '' } = req.body || {};
    if (!groupId || !ratedUserId) return res.status(400).json({ error: 'group_id and rated_user_id are required' });
    const numScore = Number(score);
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > 100) {
      return res.status(400).json({ error: 'score must be 0-100' });
    }
    if (ratedUserId === req.user.id) {
      return res.status(400).json({ error: 'Leaders cannot rate themselves' });
    }

    const db = getSupabaseAdmin();
    const group = await getGroup(db, groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group leader can rate members' });
    }

    const { data: membership } = await db
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', ratedUserId)
      .limit(1);
    if (!(membership || []).length) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }

    const { data, error } = await db
      .from('ratings')
      .upsert({
        group_id: groupId,
        class_id: group.class_id,
        rater_id: req.user.id,
        rated_user_id: ratedUserId,
        score: Math.round(numScore),
        comment,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'group_id,rated_user_id' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ rating: data });
  } catch (err) {
    next(err);
  }
});

export default router;
