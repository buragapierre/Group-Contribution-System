import supabase from '../lib/supabase';

export async function fetchGroupsByClass(classId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('class_id', classId);
  if (error) throw error;
  return data || [];
}

export async function fetchGroupsByProject(projectId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  return data || [];
}

export async function fetchProfessorGroups(professorId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*, classes!inner(professor_id)')
    .eq('classes.professor_id', professorId);
  if (error) throw error;
  return data || [];
}

export async function fetchGroupById(id) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchLeaderGroups(userId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('leader_id', userId);
  if (error) throw error;
  return data || [];
}

export async function fetchMemberGroups(userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(e => e.groups);
}

export async function fetchGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, profiles(*)')
    .eq('group_id', groupId);
  if (error) throw error;
  return (data || []).map(e => e.profiles);
}

export async function fetchGroupMemberIds(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  if (error) throw error;
  return (data || []).map(e => e.user_id);
}

export async function createGroup(groupData) {
  const { data, error } = await supabase
    .from('groups')
    .insert(groupData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGroupProgress(groupId) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('progress')
    .eq('group_id', groupId);

  if (!tasks || tasks.length === 0) return 0;

  const avg = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
  await supabase
    .from('groups')
    .update({ progress: avg })
    .eq('id', groupId);
  return avg;
}

export async function addGroupMember(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function removeGroupMember(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}
