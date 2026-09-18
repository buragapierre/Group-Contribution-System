import supabase from '../lib/supabase';

export async function fetchContributionsByClass(classId) {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('class_id', classId);
  if (error) throw error;
  return data || [];
}

export async function fetchUserContributions(userId) {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function fetchProfessorContributions(professorId) {
  const { data, error } = await supabase
    .from('contributions')
    .select('*, classes!inner(professor_id)')
    .eq('classes.professor_id', professorId);
  if (error) throw error;
  return data || [];
}

export async function upsertContribution(contribution) {
  const { data, error } = await supabase
    .from('contributions')
    .upsert(contribution, { onConflict: 'user_id,class_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
