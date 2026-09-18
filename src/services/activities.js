import supabase from '../lib/supabase';

export async function fetchUserActivities(userId) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function logActivity(activityData) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activityData)
    .select()
    .single();
  if (error) throw error;
  return data;
}
