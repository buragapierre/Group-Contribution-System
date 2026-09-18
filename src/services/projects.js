import supabase from '../lib/supabase';

export async function fetchProjectsByClass(classId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProfessorProjects(professorId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('professor_id', professorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProject(projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProjectProgress(projectId) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('progress')
    .eq('project_id', projectId);

  if (!tasks || tasks.length === 0) return;

  const avg = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
  await supabase
    .from('projects')
    .update({ overall_progress: avg })
    .eq('id', projectId);
}
