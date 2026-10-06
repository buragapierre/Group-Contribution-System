import supabase from '../lib/supabase';

const BUCKET = 'submissions';
const MAX_SIZE = 10 * 1024 * 1024;

function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadSubmissionFiles(taskId, userId, fileList) {
  const uploaded = [];
  for (const file of fileList) {
    if (file.size > MAX_SIZE) throw new Error(`${file.name} exceeds the 10MB limit`);
    const path = `task_${taskId}/${userId}/${Date.now()}_${sanitize(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;
    uploaded.push({ name: file.name, path });
  }
  return uploaded;
}
