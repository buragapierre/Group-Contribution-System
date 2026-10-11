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

// POST /api/auth/captcha  { token }
// Verifies a Cloudflare Turnstile token. Passes open when no secret is
// configured (dev mode) so the app works before keys exist.
router.post('/captcha', async (req, res, next) => {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return res.json({ ok: true, dev: true });
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'Captcha token missing' });
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const result = await verify.json();
    if (!result.success) return res.status(400).json({ error: 'Captcha check failed' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
