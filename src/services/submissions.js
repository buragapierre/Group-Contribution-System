import supabase from '../lib/supabase';

export async function fetchSubmissionsByTask(taskId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('task_id', taskId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchSubmissionsByGroup(groupId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, tasks!inner(group_id)')
    .eq('tasks.group_id', groupId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSubmission(submissionData) {
  const { data, error } = await supabase
    .from('submissions')
    .insert(submissionData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubmissionStatus(submissionId, status) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status })
    .eq('id', submissionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
