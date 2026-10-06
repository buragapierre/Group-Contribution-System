import { supabaseForToken } from '../supabase.js';

export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
  try {
    const supabase = supabaseForToken(token);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
}
