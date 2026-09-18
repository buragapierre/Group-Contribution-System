import supabase from '../lib/supabase';

export async function fetchTasksByGroup(groupId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('group_id', groupId)
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchTasksByClass(classId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('class_id', classId);
  if (error) throw error;
  return data || [];
}

export async function fetchTasksByProject(projectId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId);
  if (error) throw error;
  return data || [];
}

export async function fetchUserTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', userId)
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchTaskById(id) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProfessorTasks(professorId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, classes!inner(professor_id)')
    .eq('classes.professor_id', professorId);
  if (error) throw error;
  return data || [];
}

export async function createTask(taskData) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaskProgress(taskId, progress) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ progress })
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
