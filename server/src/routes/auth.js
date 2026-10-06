import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getSupabaseAdmin } from '../supabase.js';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('profiles')
      .select('id, email, name, role, course, year_level, section, avatar')
      .eq('id', req.user.id)
      .single();
    if (error) return res.status(404).json({ error: 'Profile not found' });
    res.json({ auth: { id: req.user.id, email: req.user.email }, profile: data });
  } catch (err) {
    next(err);
  }
});

export default router;
