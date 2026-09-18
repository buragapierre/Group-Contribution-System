-- ============================================
-- CONTRITRACK DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  course TEXT NOT NULL,
  section TEXT,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_name TEXT NOT NULL,
  color TEXT DEFAULT 'lavender',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASS ENROLLMENTS (junction: class <-> students)
CREATE TABLE IF NOT EXISTS class_enrollments (
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, user_id)
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  deadline DATE NOT NULL,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT '✦',
  overall_progress INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GROUPS
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES profiles(id),
  leader_name TEXT NOT NULL,
  progress INT DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- 5. GROUP MEMBERS (junction: group <-> students)
CREATE TABLE IF NOT EXISTS group_members (
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

-- 6. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  deadline DATE NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'assigned',
  progress INT DEFAULT 0,
  color TEXT DEFAULT 'blue'
);

-- 7. CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS contributions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  tasks_assigned INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  on_time_completions INT DEFAULT 0,
  contribution_percent INT DEFAULT 0,
  avatar TEXT,
  avatar_color TEXT DEFAULT 'blue',
  PRIMARY KEY (user_id, class_id)
);

-- 8. SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  files JSONB DEFAULT '[]',
  comment TEXT,
  status TEXT DEFAULT 'submitted'
);

-- 9. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  class_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_classes_professor ON classes(professor_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_user ON class_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_class ON projects(class_id);
CREATE INDEX IF NOT EXISTS idx_projects_professor ON projects(professor_id);
CREATE INDEX IF NOT EXISTS idx_groups_project ON groups(project_id);
CREATE INDEX IF NOT EXISTS idx_groups_class ON groups(class_id);
CREATE INDEX IF NOT EXISTS idx_groups_leader ON groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class ON tasks(class_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_class ON contributions(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles: read all, update/insert own
-- (already created in Phase 1)

-- Classes: everyone can read, professors can manage their own
CREATE POLICY "Anyone can read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Professors can insert classes" ON classes FOR INSERT WITH CHECK (auth.uid() = professor_id);
CREATE POLICY "Professors can update own classes" ON classes FOR UPDATE USING (auth.uid() = professor_id);
CREATE POLICY "Professors can delete own classes" ON classes FOR DELETE USING (auth.uid() = professor_id);

-- Class Enrollments: everyone can read, professors in that class can manage
CREATE POLICY "Anyone can read enrollments" ON class_enrollments FOR SELECT USING (true);
CREATE POLICY "Professors can manage enrollments" ON class_enrollments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.professor_id = auth.uid())
);
CREATE POLICY "Professors can delete enrollments" ON class_enrollments FOR DELETE USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.professor_id = auth.uid())
);

-- Projects: everyone can read, professors can manage their own
CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Professors can insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() = professor_id);
CREATE POLICY "Professors can update own projects" ON projects FOR UPDATE USING (auth.uid() = professor_id);
CREATE POLICY "Professors can delete own projects" ON projects FOR DELETE USING (auth.uid() = professor_id);

-- Groups: everyone can read, professors can manage
CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Professors can insert groups" ON groups FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.professor_id = auth.uid())
);
CREATE POLICY "Professors can update groups" ON groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.professor_id = auth.uid())
);
CREATE POLICY "Leaders can update own group progress" ON groups FOR UPDATE USING (auth.uid() = leader_id);
CREATE POLICY "Professors can delete groups" ON groups FOR DELETE USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = class_id AND classes.professor_id = auth.uid())
);

-- Group Members: everyone can read, leaders/professors can manage
CREATE POLICY "Anyone can read group members" ON group_members FOR SELECT USING (true);
CREATE POLICY "Leaders can manage own group members" ON group_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_id AND groups.leader_id = auth.uid())
);
CREATE POLICY "Leaders can remove own group members" ON group_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_id AND groups.leader_id = auth.uid())
);

-- Tasks: everyone can read, leaders can manage their group tasks
CREATE POLICY "Anyone can read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Leaders can insert tasks" ON tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_id AND groups.leader_id = auth.uid())
);
CREATE POLICY "Leaders can update own group tasks" ON tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_id AND groups.leader_id = auth.uid())
);
CREATE POLICY "Assigned users can update own task progress" ON tasks FOR UPDATE USING (auth.uid() = assigned_to);
CREATE POLICY "Leaders can delete own group tasks" ON tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM groups WHERE groups.id = group_id AND groups.leader_id = auth.uid())
);

-- Contributions: everyone can read, system manages via service layer
CREATE POLICY "Anyone can read contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "System can insert contributions" ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update contributions" ON contributions FOR UPDATE USING (true);

-- Submissions: everyone can read, users can insert own
CREATE POLICY "Anyone can read submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leaders can update submission status" ON submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM tasks
    JOIN groups ON groups.id = tasks.group_id
    WHERE tasks.id = task_id AND groups.leader_id = auth.uid()
  )
);

-- Activities: everyone can read, system logs
CREATE POLICY "Anyone can read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "System can insert activities" ON activities FOR INSERT WITH CHECK (true);
