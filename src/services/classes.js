import supabase from '../lib/supabase';

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function fetchClasses(professorId) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('professor_id', professorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchClassById(id) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchStudentClasses(userId) {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('class_id, classes(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(e => e.classes);
}

export async function createClass(classData) {
  const join_code = generateJoinCode();
  const { data, error } = await supabase
    .from('classes')
    .insert({ ...classData, join_code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function joinClassByCode(code, userId) {
  const { data: cls, error: findError } = await supabase
    .from('classes')
    .select('*')
    .eq('join_code', code.toUpperCase())
    .single();
  if (findError || !cls) throw new Error('Invalid class code.');

  const { error: enrollError } = await supabase
    .from('class_enrollments')
    .insert({ class_id: cls.id, user_id: userId });
  if (enrollError) {
    if (enrollError.code === '23505') throw new Error('You are already enrolled in this class.');
    throw enrollError;
  }
  return cls;
}

export async function fetchClassStudentIds(classId) {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select('user_id')
    .eq('class_id', classId);
  if (error) throw error;
  return (data || []).map(e => e.user_id);
}
